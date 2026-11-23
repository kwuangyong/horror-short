// timeline_words.js - map "cue starts when word X is spoken" onto a timeline.
//   const { wordTime, cueOnWord } = require('./timeline_words');
//   const words = JSON.parse(fs.readFileSync('words.json'));      // [{word,start,end}, ...] (tools/transcribe_words.py format)
//   cues.push(cueOnWord(words, 'growls', { actor:'grim', action:'growl', len:1.4, lead:0.1 }));
//   wordTime(words, 'tomb', 2)  -> start time of the 2nd occurrence of "tomb" (case/punctuation-insensitive)
const norm = (w) => String(w).toLowerCase().replace(/[^a-z0-9']/g, '');
function find(words, word, nth = 1) { let n = 0; for (const w of words) if (norm(w.word || w.text) === norm(word) && ++n === nth) return w; throw new Error(`word not found: ${word} #${nth}`); }
const wordTime = (words, word, nth = 1, edge = 'start') => find(words, word, nth)[edge === 'end' ? 'end' : 'start'];
function cueOnWord(words, word, o) {          // o: {actor, action, len, lead=0, nth=1, params}
  const t0 = wordTime(words, word, o.nth || 1) - (o.lead || 0);
  return { actor: o.actor, action: o.action, t0, t1: t0 + (o.len || 1), params: o.params || {} };
}
module.exports = { wordTime, cueOnWord, find };
// cut on a word: cutOnWord(words, 'bites', {type:'cu', actor:'grim', zoom:3, lead:0.05}) -> shot object for TL.shots
module.exports.cutOnWord = (words, word, o) => { const { nth, lead, ...rest } = o; return Object.assign({ t: wordTime(words, word, nth || 1) - (lead || 0) }, rest); };
