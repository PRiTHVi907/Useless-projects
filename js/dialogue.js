const ashanDialogue = {
  ready: [
    ['ശരി മോനേ, നോക്കാം.', 'calm'], ['ഇത് ആണോ നിന്റെ power?', 'mocking'], ['നിനക്ക് ഇത് പറ്റുമോ?', 'confident'],
    ['എടാ, ശ്രദ്ധിച്ചു aim ചെയ്യ്.', 'friendly'], ['ഇന്ന് physics പഠിക്കാം.', 'dramatic']
  ],
  short: [
    ['വീണ്ടും?', 'amused'], ['കുറച്ച് കൂടി power വേണം.', 'confident'], ['ഇത്രയും മതി എന്ന് തോന്നുന്നുണ്ടോ?', 'sarcastic'],
    ['ഇത് jump ആണോ അതോ പ്രാർത്ഥനയാണോ?', 'mocking'], ['കുറച്ച് മുന്നോട്ട് പോടാ.', 'annoyed']
  ],
  win: [
    ['അത് കൊള്ളാം മോനേ!', 'excited'], ['ശരി, ഇതാണ് technique.', 'confident'], ['ഇനി ഒരു round കൂടി.', 'dramatic'],
    ['ഹും... ഞാൻ പഠിപ്പിച്ചതിന്റെ result.', 'sarcastic'], ['അത് luck ആയിരുന്നു.', 'mocking']
  ],
  far: [
    ['ഞാൻ അങ്ങനെ അല്ല പറഞ്ഞത്!', 'mocking'], ['എടാ! അത്രയും power ആരാ പറഞ്ഞത്?', 'angry'], ['നേരെ നോക്കി അടിക്കെടാ!', 'annoyed'],
    ['എന്റെ നെഞ്ചത്താണോ target?!', 'furious'], ['നീ കേൾക്കുന്നത് നിന്റെ സ്വന്തം version ആണല്ലോ.', 'sarcastic']
  ],
  irritated: [
    ['നീ വീട്ടിൽ നിന്നാണോ പഠിച്ചത്?', 'annoyed'], ['ഇവനൊക്കെ ആരാണ് admission കൊടുത്തത്?', 'angry'], ['ഇനി ഞാൻ പറയില്ല.', 'furious'],
    ['ഇത് Kalari ആണെടാ, cricket അല്ല.', 'dramatic'], ['Physics-നെക്കാൾ എനിക്ക് നിന്നെ വിശ്വാസമില്ല.', 'furious']
  ]
};

const recentAshanLines = [];

function chooseAshanLine(category, failureCount) {
  let lines = ashanDialogue[category] || ashanDialogue.ready;
  if (failureCount >= 3 && category !== 'win') lines = lines.concat(ashanDialogue.irritated);
  const available = lines.filter((line) => !recentAshanLines.includes(line[0]));
  const selected = (available.length ? available : lines)[Math.floor(Math.random() * (available.length || lines.length))];
  recentAshanLines.push(selected[0]);
  if (recentAshanLines.length > 5) recentAshanLines.shift();
  return { text: selected[0], emotion: selected[1] };
}