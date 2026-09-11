const ashanDialogue = {
  ready: [
    'ശരി മോനേ, നോക്കാം.', 'ഇത് ആണോ നിന്റെ power?', 'നിനക്ക് ഇത് പറ്റുമോ?',
    'എടാ, ശ്രദ്ധിച്ചു aim ചെയ്യ്.', 'ഇന്ന് physics പഠിക്കാം.'
  ],
  short: [
    'വീണ്ടും?', 'കുറച്ച് കൂടി power വേണം.', 'ഇത്രയും മതി എന്ന് തോന്നുന്നുണ്ടോ?',
    'ഇത് jump ആണോ അതോ പ്രാർത്ഥനയാണോ?', 'കുറച്ച് മുന്നോട്ട് പോടാ.'
  ],
  win: [
    'അത് കൊള്ളാം മോനേ!', 'ശരി, ഇതാണ് technique.', 'ഇനി ഒരു round കൂടി.',
    'ഹും... ഞാൻ പഠിപ്പിച്ചതിന്റെ result.', 'അത് luck ആയിരുന്നു.'
  ],
  far: [
    'ഞാൻ അങ്ങനെ അല്ല പറഞ്ഞത്!', 'എടാ! അത്രയും power ആരാ പറഞ്ഞത്?', 'നേരെ നോക്കി അടിക്കെടാ!',
    'എന്റെ നെഞ്ചത്താണോ target?!', 'നീ കേൾക്കുന്നത് നിന്റെ സ്വന്തം version ആണല്ലോ.'
  ],
  irritated: [
    'നീ വീട്ടിൽ നിന്നാണോ പഠിച്ചത്?', 'ഇവനൊക്കെ ആരാണ് admission കൊടുത്തത്?', 'ഇനി ഞാൻ പറയില്ല.',
    'ഇത് Kalari ആണെടാ, cricket അല്ല.', 'Physics-നെക്കാൾ എനിക്ക് നിന്നെ വിശ്വാസമില്ല.'
  ]
};

function getRageLevel(ashanRage) {
  if (ashanRage <= 20) return 'CALM';
  if (ashanRage <= 40) return 'AMUSED';
  if (ashanRage <= 60) return 'MOCKING';
  if (ashanRage <= 80) return 'ANNOYED';
  return 'FURIOUS';
}
const recentAshanLines = [];

function chooseAshanLine(category, failureCount) {
  let lines = ashanDialogue[category] || ashanDialogue.ready;
  if (failureCount >= 3 && category !== 'win') lines = lines.concat(ashanDialogue.irritated);
  const available = lines.filter((line) => !recentAshanLines.includes(line));
  const selected = (available.length ? available : lines)[Math.floor(Math.random() * (available.length || lines.length))];
  recentAshanLines.push(selected);
  if (recentAshanLines.length > 5) recentAshanLines.shift();
  return selected;
}