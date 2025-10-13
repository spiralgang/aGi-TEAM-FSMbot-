const axios = require('axios');
const fs = require('fs');

const MCP_CONFIG = {
  servers: {
    github: {
      type: 'http',
      url: 'https://api.githubcopilot.com/mcp/',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_MCP_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    }
  }
};

async function enableCopilotMCP() {
  try {
    const response = await axios.post(
      `${MCP_CONFIG.servers.github.url}enable`, 
      {
        org: 'spiralgang',
        repo: 'aGi-TEAM-FSMbot-',
        features: {
          copilot: true,
          mcp: true
        }
      },
      { headers: MCP_CONFIG.servers.github.headers }
    );
    
    console.log('Copilot MCP enabled:', response.data);
    
    // Save MCP config
    fs.writeFileSync(
      '.github/copilot/mcp-config.json',
      JSON.stringify(MCP_CONFIG, null, 2)
    );

  } catch (error) {
    console.error('Error enabling Copilot MCP:', error.response?.data || error.message);
    process.exit(1);
  }
}

enableCopilotMCP();
