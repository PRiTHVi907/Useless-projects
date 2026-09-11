const ashanDialogue = {
  ready: [
    'ശരി മോനേ, നോക്കാം.',
    'ഇത് ആണോ നിന്റെ power?',
    'നിനക്ക് ഇത് പറ്റുമോ?'
  ],
  short: [
    'വീണ്ടും?',
    'കുറച്ച് കൂടി power വേണം.',
    'ഇത്രയും മതി എന്ന് തോന്നുന്നുണ്ടോ?'
  ],
  win: [
    'അത് കൊള്ളാം മോനേ!',
    'ശരി, ഇതാണ് technique.',
    'ഇനി ഒരു round കൂടി.'
  ],
  far: [
    'ഞാൻ അങ്ങനെ അല്ല പറഞ്ഞത്.',
    'ഞാൻ തന്നെ വന്ന് ഇടണോ?',
    'ഇത് വരെ മനസ്സിലായില്ലേ?'
  ],
  irritated: [
    'നീ വീട്ടിൽ നിന്നാണോ പഠിച്ചത്?',
    'ഇവനൊക്കെ ആരാണ് admission കൊടുത്തത്?',
    'ഇനി ഞാൻ പറയില്ല.'
  ]
};

function chooseAshanLine(category, failureCount) {
  let lines = ashanDialogue[category] || ashanDialogue.ready;
  if (failureCount >= 3 && category !== 'win') {
    lines = lines.concat(ashanDialogue.irritated);
  }
  return lines[Math.floor(Math.random() * lines.length)];
}