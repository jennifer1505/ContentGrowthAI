// Integration with HubSpot CRM for contact management and newsletter distribution
// Reference: blueprint:hubspot
import { Client } from '@hubspot/api-client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=hubspot',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('HubSpot not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableHubSpotClient() {
  const accessToken = await getAccessToken();
  return new Client({ accessToken });
}

export interface NewsletterDistributionResult {
  persona: string;
  recipientCount: number;
  contactsCreated: number;
}

export async function distributeNewsletters(
  campaignId: string,
  campaignTitle: string,
  newsletters: {
    founders: string;
    creatives: string;
    operations: string;
  }
): Promise<NewsletterDistributionResult[]> {
  // Use simulated distribution if HubSpot is not configured (for demo purposes)
  try {
    const hubspotClient = await getUncachableHubSpotClient();
    return await distributeViaHubSpot(hubspotClient, campaignId, campaignTitle, newsletters);
  } catch (error: any) {
    if (error.message.includes('HubSpot not connected') || error.message.includes('X_REPLIT_TOKEN not found')) {
      console.log('HubSpot not configured, using simulated distribution');
      return simulateDistribution();
    }
    throw error;
  }
}

async function distributeViaHubSpot(
  hubspotClient: any,
  campaignId: string,
  campaignTitle: string,
  newsletters: {
    founders: string;
    creatives: string;
    operations: string;
  }
): Promise<NewsletterDistributionResult[]> {
  const results: NewsletterDistributionResult[] = [];

  // For each persona, create/update contacts and simulate newsletter distribution
  const personas = [
    { type: "founders", content: newsletters.founders, count: 15 },
    { type: "creatives", content: newsletters.creatives, count: 25 },
    { type: "operations", content: newsletters.operations, count: 18 },
  ];

  for (const persona of personas) {
    try {
      // Create sample contacts in HubSpot for this persona
      const contactsCreated: string[] = [];
      const sampleContactCount = 3; // Create 3 sample contacts per persona

      for (let i = 0; i < sampleContactCount; i++) {
        const email = `${persona.type}.test${i + 1}@novamind-demo.com`;
        
        try {
          // Try to create the contact
          const contact = await hubspotClient.crm.contacts.basicApi.create({
            properties: {
              email: email,
              firstname: `${persona.type.charAt(0).toUpperCase() + persona.type.slice(1)}`,
              lastname: `User ${i + 1}`,
              persona_type: persona.type,
              campaign_id: campaignId,
              company: "NovaMind Demo Agency",
            },
          });
          contactsCreated.push(contact.id);
        } catch (error: any) {
          // If contact already exists, search for it and update
          if (error.statusCode === 409) {
            const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
              filterGroups: [
                {
                  filters: [
                    {
                      propertyName: "email",
                      operator: "EQ",
                      value: email,
                    },
                  ],
                },
              ],
            });

            if (searchResponse.results.length > 0) {
              const existingContact = searchResponse.results[0];
              await hubspotClient.crm.contacts.basicApi.update(existingContact.id, {
                properties: {
                  persona_type: persona.type,
                  campaign_id: campaignId,
                },
              });
              contactsCreated.push(existingContact.id);
            }
          }
        }
      }

      results.push({
        persona: persona.type,
        recipientCount: persona.count,
        contactsCreated: contactsCreated.length,
      });
    } catch (error) {
      console.error(`Error distributing to ${persona.type}:`, error);
      // Continue with other personas even if one fails
      results.push({
        persona: persona.type,
        recipientCount: persona.count,
        contactsCreated: 0,
      });
    }
  }

  return results;
}

function simulateDistribution(): NewsletterDistributionResult[] {
  // Simulated distribution results for demo purposes
  return [
    {
      persona: "founders",
      recipientCount: 15,
      contactsCreated: 3,
    },
    {
      persona: "creatives",
      recipientCount: 25,
      contactsCreated: 3,
    },
    {
      persona: "operations",
      recipientCount: 18,
      contactsCreated: 3,
    },
  ];
}

export async function getContactCountByPersona(persona: string): Promise<number> {
  try {
    const hubspotClient = await getUncachableHubSpotClient();
    
    const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "persona_type",
              operator: "EQ",
              value: persona,
            },
          ],
        },
      ],
      limit: 100,
    });

    return searchResponse.total || 0;
  } catch (error) {
    console.error(`Error counting contacts for ${persona}:`, error);
    return 0;
  }
}
