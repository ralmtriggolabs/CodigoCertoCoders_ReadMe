// process.js
const fs = require('fs');
const path = require('path');

// Garantir estrutura inicial do badges.json
function loadBadges() {
  try {
    const raw = fs.readFileSync('badges.json', 'utf8').trim();
    if (!raw) throw new Error("Empty or invalid JSON");
    return JSON.parse(raw);
  } catch (err) {
    const defaultData = {
      mestreDaDocumentacao: [],
      devApoiaDev: []
    };
    fs.writeFileSync('badges.json', JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

function main() {
  const badgeType = process.env.BADGE_TYPE;   // mestre / apoia
  const githubUser = process.env.PR_USER;
  const repository = process.env.REPO_URL;
  const name = githubUser;
  const date = new Date().toISOString().split('T')[0];

  console.log(`Processando badge ${badgeType} para ${githubUser}`);

  // Garantir que diretórios existam
  if (!fs.existsSync('badges')) fs.mkdirSync('badges', { recursive: true });
  if (!fs.existsSync('certificados')) fs.mkdirSync('certificados', { recursive: true });

  const badges = loadBadges();

  // Registrar no badges.json
  if (badgeType === "mestre") {
    badges.mestreDaDocumentacao.push({ githubUser, name, repository, date });
  } else {
    badges.devApoiaDev.push({ githubUser, name, repository, date });
  }

  fs.writeFileSync('badges.json', JSON.stringify(badges, null, 2));
  console.log('✅ Badge registrado em badges.json');

  // Criar Badge SVG
  const badgeLabel = badgeType === "mestre"
    ? "Mestre da Documentação"
    : "Dev que Apoia Dev";

  const svg = `
<svg width="420" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="100" fill="#1e1e1e" rx="12"></rect>
  <text x="210" y="55" font-size="20" fill="white"
    font-family="Arial, sans-serif"
    text-anchor="middle"
    alignment-baseline="middle">
    ${badgeLabel}
  </text>
</svg>
`;

  const svgFilename = `badges/${githubUser}-${badgeType}.svg`;
  fs.writeFileSync(svgFilename, svg);
  console.log(`✅ Badge SVG criado: ${svgFilename}`);

  // Certificado MD
  const tplPath = badgeType === "mestre"
    ? "templates/MestreDaDocumentacao.md"
    : "templates/DevApoiaDev.md";

  try {
    let template = fs.readFileSync(tplPath, "utf8");

    template = template
      .replace(/{{githubUser}}/g, githubUser)
      .replace(/{{name}}/g, githubUser)
      .replace(/{{repository}}/g, repository)
      .replace(/{{date}}/g, date);

    const certFilename = badgeType === "mestre"
      ? `certificados/${githubUser}-MestreDaDocumentacao.md`
      : `certificados/${githubUser}-DevApoiaDev.md`;

    fs.writeFileSync(certFilename, template);
    console.log(`✅ Certificado criado: ${certFilename}`);

  } catch (error) {
    console.error('❌ Erro ao criar certificado:', error.message);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { loadBadges, main };