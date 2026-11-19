// Letter / sound cue pictures: original 16x16 pixel sprites in the same style as the item icons.
// Usage: node art/cues.js  -> writes art/cues/{id}.svg
const fs = require('fs'); const path = require('path');
const { sprite, svg } = require('./items.js');
const P = { r: '#D9483B', R: '#A8302A', o: '#E8732C', O: '#F2A541', y: '#F2C94C', Y: '#FFE58A', g: '#4F9A3A', G: '#8BD86A', d: '#2F6B2A',
  b: '#3D6FB0', B: '#7FB8F0', c: '#56D6E2', w: '#FFFFFF', W: '#F4EAD6', n: '#8A5A2E', N: '#5E3B1F', m: '#C9A26B', p: '#F29CB0',
  s: '#8792A0', S: '#C9D1DA', x: '#3A1420', e: '#F2C29A', E: '#D99A6C', h: '#9A88B8', H: '#76649A', z: '#5A5866', l: '#B07AE6' };
const pic = (arr, x = 1, y = 1, extra) => sprite(t => { t.rows(x, y, arr, P); if (extra) extra(t); });
const disc = (t, cx, cy, r, c) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) t.px(x, y, c); };
const ring = (t, cx, cy, r, c) => { for (let a = 0; a < 64; a++) t.px(cx + r * Math.cos(a / 64 * 2 * Math.PI), cy + r * Math.sin(a / 64 * 2 * Math.PI), c); };
const face = (mouth) => sprite(t => { disc(t, 7.5, 7.5, 6.6, P.y); t.px(4, 4, P.Y); t.px(5, 3, P.Y); t.rect(5, 5, 1, 2, P.x); t.rect(10, 5, 1, 2, P.x); mouth(t); });

const CUES = {
  fire: pic(['......r.......', '.....rr.......', '.....ror...r..', '....roor..rr..', '...rroor.ror..', '...roooorroor.', '..rrooOoooor..', '..rooOOOooorr.', '.rrooOyyOoor..', '.rooOyyyyOoor.', '.rooOyYYyOoor.', '.roooOyYyOoor.', '..rrooOyOorr..', '...rrrrrrrr...']),
  melon: pic(['rrrrrrrrrrrrrr', 'rrxrrrrrxrrrxr', 'rrrrrxrrrrrrrr', 'WrrrrrrrrrxrrW', '.WrrxrrrrrrrW.', '.GWrrrrrxrrWG.', '..GWWrrrrWWG..', '..ggGWWWWGgg..', '...gggggggg...', '.....gggg.....'], 1, 3),
  house: pic(['......RR......', '.....RrrR.....', '....RrrrrR....', '...RrrrrrrR...', '..RrrrrrrrrR..', '.RRRRRRRRRRRR.', '..WWWWWWWWWW..', '..WBBWWWWWWW..', '..WBBWWWnnnW..', '..WWWWWWnnnW..', '..WWWWWWnynW..', '..WWWWWWnnnW..', 'gggggggggggggg']),
  banana: pic(['............N.', '...........yy.', '..........yYy.', '.........yYyy.', '........yYyyy.', '.......yYyyy..', 'N....yyYyyy...', 'yy.yyyyyyyO...', '.yyYYyyyyO....', '..yyyyyyO.....', '....OOO.......'], 1, 2),
  carrot: pic(['..........gG.g', '.........gGgG.', '..........gGg.', '........oo.g..', '.......oOoo...', '......oOooo...', '.....oOooo....', '....oOoNoo....', '...oooooo.....', '...oNooo......', '..oooo........', '..ooo.........', '.oo...........', '.o............']),
  icecream: pic(['....pppppp....', '...pwpppppp...', '..pwwppppppp..', '..pwpppppppp..', '..pppppppppp..', '...pBpppyppp..', '..mmmmmmmmmm..', '...mnmnmnmmm..', '...mmnmnmnm...', '....mnmnmm....', '....mmnmnm....', '.....mnmm.....', '......mm......', '.......m......']),
  guitar: pic(['......NN......', '......Nn......', '......nN......', '......Nn......', '....OOnNOO....', '...OOOWWOOO...', '...OOOWWOOO...', '....OOWWOO....', '...OOONNOOO...', '..OOOONNOOOO..', '..OOOOWWOOOO..', '..OOOONNOOOO..', '...OOOOOOOO...', '....OOOOOO....']),
  fish: pic(['....bbbbb....b', '..bbBBBBbb..bb', '.bwxBBBBBbbbbb', '.bBBBBBBBbbbb.', '.bbBBBBBbbbbbb', '..bbbbbbbb..bb', '....bbbbb....b'], 1, 5),
  door: pic(['..NNNNNNNNNN..', '..NnnnnnnnnN..', '..NnmmmnmmmN..', '..NnmmmnmmmN..', '..NnmmmnmmmN..', '..NnnnnnnnnN..', '..NnmmmnmmmN..', '..NnmmmnyymN..', '..NnmmmnyymN..', '..NnmmmnmmmN..', '..NnnnnnnnnN..', '..NnmmmnmmmN..', '..NnmmmnmmmN..', '..NNNNNNNNNN..']),
  mountain: pic(['......WW......', '.....WWWW.....', '....WWsWWs....', '....sssSss....', '...ssSsssss...', '..sssssSssss..', '..ssSssssssss.', '.gsssssssSsss.', '.ggsssSssssgs.', 'gggggssssgggg.', 'gGggggggggGggg'], 1, 3),
  burger: pic(['...mmmmmmmm...', '..mWmmmmWmmm..', '.mmmWmmmmmWmm.', '.mmmmmmmmmmmm.', '.GgGgGgGgGgGg.', '.rrrrrrrrrrrr.', '.NNNNNNNNNNNN.', '.nNnNnNnNnNnN.', '.yyyyyyyyyyyy.', '.mmmmmmmmmmmm.', '..mmmmmmmmmm..'], 1, 3),
  hippo: pic(['..hh......hh..', '..hHh....hHh..', '...hhhhhhhh...', '..hhxhhhhxhh..', '..hhhhhhhhhh..', '.hhhhhhhhhhhh.', 'hhhhhhhhhhhhhh', 'hhHHhhhhhhHHhh', 'hhHHhhhhhhHHhh', 'hhhhhhhhhhhhhh', '.hhwhhhhhhwhh.', '..hhhhhhhhhh..'], 1, 2),
  rose: pic(['....rrrr......', '...rRrrRr.....', '..rrRRrRrr....', '..rRrrRRrr....', '...rrRrrr.....', '....rrrr......', '......g.......', '......g..gg...', '..gg..g.gGg...', '..gGg.ggg.....', '....ggg.......', '......g.......', '......g.......'], 2, 1),
  curtain: pic(['NNNNNNNNNNNNNN', 'bbbbWBBBBWbbbb', 'bBbbWBBBBWbbBb', 'bBbbWBBBBWbbBb', 'bBbbWWWWWWbbBb', 'bBbbWBBBBWbbBb', 'bBbbWBBBBWbbBb', 'bBbWWBBBBWWbBb', 'bBbWWWWWWWWbBb', 'bBb........bBb', 'bBbb......bbBb', 'bbbb......bbbb'], 1, 2),
  zombie: pic(['...NNNNNNNN...', '..NNNNNNNNNN..', '..gGgggggggg..', '..gGgggggggg..', '..gxxggggxxg..', '..gxwgggxwgg..', '..gggggdgggg..', '..ggggddgggg..', '..gggggggggg..', '..gxWxWxWxgg..', '..gggggggggg..', '...gggggggg...'], 1, 2),
  fly: pic(['...BB....BB...', '..BWWB..BWWB..', '..BWWWBBWWWB..', '...BWWWWWWB...', '.....zzzz.....', '....xzzzzx....', '....xxzzxx....', '.....zzzz.....', '....zszszz....', '.....zszs.....', '......zz......'], 1, 2),
  gold: pic(['....YYYYYYY...', '...YyyyyyyyY..', '..YyyyyyyyyyO.', '..yyyyyyyyyyO.', '..yyyyyyyyyyO.', '..OOOOOOOOOOO.'], 1, 5, t => { t.px(4, 6, P.w); t.px(5, 6, P.w); }),
  cat: pic(['..O........O..', '..OO......OO..', '..OpO....OpO..', '..OOOOOOOOOO..', '.OOOOOOOOOOOO.', '.OOxGOOOOxGOO.', '.OOxxOOOOxxOO.', '.OOOOOppOOOOO.', 'WOOOOOxxOOOOOW', '.WOOOxOOxOOOW.', '..OOOOOOOOOO..', '...OOOOOOOO...'], 1, 2),
  rocket: pic(['......rr......', '.....rWWr.....', '.....WWWW.....', '....WWBBWW....', '....WBBBBW....', '....WWBBWW....', '....WWWWWW....', '....WWWWWW....', '...rWWWWWWr...', '..rrWWWWWWrr..', '..rr.WWWW.rr..', '......OO......', '.....OyyO.....', '......O.......']),
  drop: pic(['......B.......', '......B.......', '.....BBB......', '.....BBB......', '....BBBBB.....', '....BWBBB.....', '...BWBBBBB....', '...BWBBBBB....', '...BBBBBBb....', '...BBBBBbb....', '....BBbbb.....', '.....bbb......'], 2, 2),
  ring: pic(['.....cwcc.....', '....cccccc....', '.....cccc.....', '......yy......', '....yyYYyy....', '...yY....yy...', '..yY......yy..', '..yY......yy..', '..yy......yy..', '...yy....yy...', '....yyyyyy....'], 1, 2),
  hand: pic(['.....e.e......', '...e.e.e.e....', '...e.e.e.e....', '...e.e.e.e....', '...eEeEeEe....', '...eeeeeee.ee.', '...eeeeeeeeee.', '...eeeeeeeee..', '...eeeeeeee...', '....eeeeeee...', '....eeeeee....', '.....eeeee....', '.....EEEEE....']),
  moon: sprite(t => { disc(t, 7, 8, 6.4, P.y); disc(t, 10.5, 5.5, 5.4, null); t.px(3, 7, P.Y); t.px(3, 8, P.Y); t.px(4, 11, P.Y); }),
  schoolbag: pic(['....NNNNNN....', '...N......N...', '..rrrrrrrrrr..', '..rRRRRRRRRr..', '..rrrrrrrrrr..', '..rrrryyrrrr..', '..rrrrrrrrrr..', '..rbbbbbbbbr..', '..rbBBBBBBbr..', '..rbbbbbbbbr..', '..rrrrrrrrrr..', '..RR......RR..'], 1, 2),
  star: pic(['......y.......', '......y.......', '.....yYy......', '.....yYy......', 'yyyyyyYyyyyyy.', '.yyyYYYYYyyy..', '..yyyYYYyyy...', '...yyYYYyy....', '...yyyyyyy....', '..yyy...yyy...', '..yy.....yy...', '.yy.......yy..'], 1, 2),
  crown: pic(['.y....y.....y.', '.yy..yyy...yy.', '.yYy.yYy..yYy.', '.yYyyyYyyyyYy.', '.yyyyyyyyyyyy.', '.yryyycyyyryy.', '.yyyyyyyyyyyy.', '.OOOOOOOOOOOO.'], 1, 4),
  dog: pic(['..NN......NN..', '.NNNmmmmmmNNN.', '.NNmmmmmmmmNN.', '.NNmxmmmmxmNN.', '.NNmmmmmmmmNN.', '.NN.mmmmmm.NN.', '..N.mWxxWm.N..', '....mWWWWm....', '....mWWpWm....', '.....mmmm.....'], 1, 3),
  heart: pic(['..rrr...rrr...', '.rWrrr.rrrrr..', '.rWrrrrrrrrr..', '.rrrrrrrrrrr..', '..rrrrrrrrr...', '...rrrrrrr....', '....rrrrr.....', '.....rrr......', '......r.......'], 2, 3),
  lemon: pic(['......g.......', '.....ggG......', '...yyyyyy.....', '..yYYyyyyy....', '.yYyyyyyyyy...', 'yyYyyyyyyyyy..', 'yyyyyyyyyyyyy.', '.yyyyyyyyyyO..', '..yyyyyyyyO...', '...yyyyyOO....'], 1, 3),
  key: pic(['...yyyy.......', '..yY..yy......', '..y....y......', '..y....y......', '..yy..yy......', '...yyyy.......', '....yy........', '....yy........', '....yyyy......', '....yy........', '....yyyy......', '....yy........'], 4, 2),
  snake: sprite(t => { for (let x = 1; x <= 10; x++) { const y = Math.round(9 + 2.4 * Math.sin(x * 0.8)); t.rect(x, y, 1, 3, P.g); t.px(x, y + 2, P.G); if (x % 2) t.px(x, y, P.d); }
    t.rect(10, 4, 4, 3, P.g); t.rect(10, 6, 4, 1, P.G); t.px(12, 4, P.x); t.px(14, 5, P.r); t.px(15, 4, P.r); t.px(15, 6, P.r); }),
  candle: pic(['......O.......', '.....OyO......', '.....yYy......', '......y.......', '......N.......', '.....WWWW.....', '.....WWWS.....', '.....WWWS.....', '.....WWWS.....', '.....WWWS.....', '.....WWWS.....', '...SSSSSSSS...', '..ssssssssss..']),
  ant: pic(['.R............', '..R...........', '..RRR.....RRR.', '.RRwRR.R.RRRRR', '.RRRRRRRRRRRRR', '..RRR.RR.RRRR.', '..R.R.R.R..R..', '.R..R.R..R..R.', 'R...R.R...R..R'], 1, 4),
  skull: pic(['...WWWWWWWW...', '..WWWWWWWWWW..', '.WWWWWWWWWWWW.', '.WWxxxWWxxxWW.', '.WWxxxWWxxxWW.', '.WWWWWWWWWWWW.', '..WWWWxWWWWW..', '...WWWWWWWW...', '...WxWxWxWW...', '....WWWWWW....'], 1, 3),
  candy: pic(['p...........p.', 'pp..rrrrrr..pp', 'ppprWrrrrrrppp', 'pppWrrWrrrrppp', 'ppprrrrrrWrppp', 'pp..rrrrrr..pp', 'p...........p.'], 1, 5),
  cake: pic(['......r.......', '......y.......', '......W.......', '..WWWWWWWWWW..', '.WpWWpWWWpWWp.', '.nnnnnnnnnnnn.', '.pppppppppppp.', '.nnnnnnnnnnnn.', '.nnnnnnnnnnnn.', '.SSSSSSSSSSSS.'], 1, 3),
  pizza: pic(['NNNNNNNNNNNNNN', 'mmmmmmmmmmmmmm', '.yyryyyyyryyy.', '.yyyyyyyryyy..', '..yyryyyyyy...', '..yyyyyryy....', '...yyyyyy.....', '...yyryy......', '....yyy.......', '....yy........', '.....y........'], 1, 2),
  bird: pic(['....bbbb......', '...bbwxbb.....', '...bbbbbbOO...', '....bbbbb.....', '..bbbbbbbbb...', '.BBbbbbbbbbb..', 'BBBBbbbbbbbb..', '.BBBBbbbbbb...', '...bbbbbb.....', '....O..O......', '....O..O......'], 2, 2),
  frog: pic(['..GG......GG..', '.GwxG....GwxG.', '.GxxGGGGGGxxG.', '.GGGGGGGGGGGG.', 'GGGGGGGGGGGGGG', 'GGddddddddddGG', '.GGGGGGGGGGGG.', '..GgGGGGGGgG..', '.GG..GGGG..GG.'], 1, 3),
  plate: pic(['...WWWWWWWW...', '..WSSSSSSSSW..', '.WSWWWWWWWWSW.', '.WSWWrWWGWWSW.', '.WSWWWWWWWWSW.', '..WSSSSSSSSW..', '...WWWWWWWW...'], 1, 4),
  monkey: pic(['...nnnnnnnn...', '..nnnnnnnnnn..', 'mnnmmmnnmmmnnm', 'mnmmxmmmmxmmnm', '.nmmmmmmmmmmn.', '.nnmmmNNmmmnn.', '..nmmmmmmmmn..', '..nnmxxxxmnn..', '...nnmmmmnn...', '.....nnnn.....'], 1, 3),
  robot: pic(['......r.......', '......s.......', '..SSSSSSSSSS..', '..SBBSSSSBBS..', '..SBBSSSSBBS..', '..SSSSSSSSSS..', '..SSxxxxxxSS..', '..SSSSSSSSSS..', '....ssssss....', '.SSSSSSSSSSSS.', '.SSSSyrySSSSS.', '.SSSSSSSSSSSS.']),
  pomegranate: pic(['.....RrR......', '......R.......', '....rrrrr.....', '..rrrrrrrrr...', '.rrWrrrrrrrr..', '.rWrrrrrrrrrr.', '.rrrrrrrrrrrr.', '.rrrrrrrrrrRr.', '..rrrrrrrrRr..', '...rrrrrRR....', '.....rRR......'], 1, 2),
  train: pic(['...ss.........', '...ss..rrrrr..', '..rrrrrrBBBr..', '..rrrrrrBBBr..', '..rrrrrrrrrr..', '.rrrrrrrrrrrr.', '.ryrrrrrrrrrr.', '.rrrrrrrrrrrr.', '..xx..xx..xx..', '..xx..xx..xx..'], 1, 3),
  sun: sprite(t => { disc(t, 7.5, 7.5, 3.6, P.y); t.px(6, 6, P.Y); [[7, 1], [8, 1], [7, 14], [8, 14], [1, 7], [1, 8], [14, 7], [14, 8], [3, 3], [12, 3], [3, 12], [12, 12], [2, 2], [13, 2], [2, 13], [13, 13]].forEach(([x, y]) => t.px(x, y, P.O)); }),
  clock: sprite(t => { disc(t, 7.5, 7.5, 6.4, P.r); disc(t, 7.5, 7.5, 5.2, P.W); t.line(7, 7, 7, 4, P.x); t.line(8, 8, 10, 9, P.x); [[7, 3], [12, 7], [7, 12], [3, 7]].forEach(([x, y]) => t.px(x, y, P.s)); }),
  chocolate: pic(['..NNNNNNNNNN..', '..NnnNnnNnnN..', '..NnnNnnNnnN..', '..NNNNNNNNNN..', '..NnnNnnNnnN..', '..NnnNnnNnnN..', '..NNNNNNNNNN..', '..rrrrrrrrrr..', '..rWWrrrrrrr..', '..rrrrrrrrrr..', '..rrrrrrrrrr..'], 1, 2),
  apple: sprite(t => { disc(t, 7.5, 9, 5.6, P.r); t.px(5, 6, P.W); t.px(5, 7, P.W); t.rect(7, 2, 1, 3, P.N); t.rect(8, 2, 3, 1, P.g); t.px(9, 1, P.G); }),
  strawberry: pic(['....g.gg.g....', '....gGGGGg....', '..rrrggggrrr..', '.rrrrrrrrrrrr.', '.rryrrryrrrrr.', '.rrrrrrrrryrr.', '..rrryrrrrrr..', '..rrrrrryrr...', '...rryrrrr....', '....rrrrr.....', '.....rrr......'], 1, 2),
  drum: pic(['..WWWWWWWWWW..', '.WSSSSSSSSSSW.', '.rWWWWWWWWWWr.', '.ryrrryrrryrr.', '.rryryryryrrr.', '.rrrryrrryrrr.', '.rrrrrrrrrrrr.', '.yyyyyyyyyyyy.', '..rrrrrrrrrr..'], 1, 4, t => { t.line(2, 1, 5, 4, P.m); t.line(13, 1, 10, 4, P.m); }),
  road: sprite(t => { t.rect(1, 4, 14, 10, P.G); t.rect(1, 2, 14, 2, P.B); for (let y = 4; y < 14; y++) { const w = Math.round(1 + (y - 4) * 0.62); t.rect(8 - w, y, 2 * w, 1, P.z); } [5, 8, 11].forEach(y => t.px(7, y, P.y)); [5, 8, 11].forEach(y => t.px(8, y + 1, P.y)); t.px(3, 6, P.g); t.px(12, 9, P.g); t.px(2, 11, P.g); }),
  sea: pic(['..BB....BB....', '.BWWB..BWWB...', 'BbbBBBBbbBBBB.', 'bbbbbbbbbbbbbb', 'bBBbbbBBbbbBBb', 'bbbbbbbbbbbbbb', 'bbbbbBBbbbbbbb', 'bbbbbbbbbbbbbb'], 1, 6, t => { disc(t, 11.5, 3, 2.4, P.y); t.px(11, 2, P.Y); }),
  rain: pic(['....SSSS......', '...SWWWWS.SS..', '.SSWWWWWWSWWS.', 'SWWWWWWWWWWWWS', 'SWWWWWWWWWWWWS', '.SSSSSSSSSSSS.', '..............', '..B...B...B...', '..B...B...B...', '....B...B...B.', '....B...B...B.', '..B...B...B...']),
  balloon: sprite(t => { disc(t, 7.5, 6, 5, P.r); t.px(5, 3, P.p); t.px(5, 4, P.p); t.px(4, 4, P.p); t.rect(7, 11, 2, 1, P.R); t.line(8, 12, 7, 14, P.N); t.px(8, 15, P.N); }),
  spoon: sprite(t => { t.line(2, 13, 9, 6, P.s); t.line(3, 13, 10, 6, P.S); disc(t, 11, 4, 2.6, P.S); t.px(10, 3, P.w); }),
  chicken: pic(['....rr........', '...rWWW.......', '...WxWWO......', '...WWWWOO.....', '...rWWW.......', '....WWWWWWW...', '...WWWWWWWWW..', '...WWWSSSWWWW.', '...WWWWSSWWW..', '....WWWWWWW...', '......O.O.....', '......O.O.....'], 1, 2),
  beach: pic(['...........yy.', '..........yYYy', '..........yYYy', '...........yy.', '..............', 'BBBBBBBBBBBBBB', 'bbBBbbbbBBbbbb', 'bbbbbbbbbbbbbb', 'mmmmmmmbbbbbbb', 'mmmmmmmmmmmbbb', 'mmmYmmmmmmmmmm', 'mmmmmmmmYmmmmm'], 1, 2),
  juice: pic(['........r.....', '.........r....', '..SSSSSSSrSS..', '..SOOOOOOrOS..', '..SOOYOOOrOS..', '..SOOOOOOOOS..', '...SOOOOOOS...', '...SOOOOOOS...', '...SOOOOOOS...', '....SSSSSS....'], 1, 3),
  car: pic(['....rrrrrr....', '...rBBrrBBr...', '..rBBBrrBBBr..', '.rrrrrrrrrrrr.', 'rrrrrrrrrrrryr', 'yrrrrrrrrrrrrr', 'rrrrrrrrrrrrrr', '.rxxrrrrrrxxr.', '.xxSxx..xxSxx.', '..xxx....xxx..'], 1, 3),
  pants: pic(['..NNNNNNNNNN..', '..bbbbbbbbbb..', '..bbbbybbbbb..', '..bbbbbbbbbb..', '..bbbbbbbbbb..', '..bbbbBbbbbb..', '..bbbb..bbbb..', '..bbbb..bbbb..', '..bBbb..bBbb..', '..bbbb..bbbb..', '..bbbb..bbbb..', '..bbbb..bbbb..', '..BBBB..BBBB..']),
  glasses: pic(['x............x', '.x..........x.', '.xxxxx..xxxxx.', '.xBBBxxxxBBBx.', '.xBwBx..xBwBx.', '.xBBBx..xBBBx.', '.xxxxx..xxxxx.'], 1, 5),
  book: pic(['..rrrrrrrrrr..', '..rRrrrrrrrr..', '..rRryyyyyrr..', '..rRrrrrrrrr..', '..rRryyyyrrr..', '..rRrrrrrrrr..', '..rRrrrrrrrr..', '..rRrrrrrrrr..', '..rRrrrrrrrr..', '..rRWWWWWWWW..', '..rrrrrrrrrr..'], 1, 2),
  phone: pic(['...xxxxxxxx...', '...xBBBBBBx...', '...xBwBBBBx...', '...xBBBBBBx...', '...xBBBBBBx...', '...xBBBBBBx...', '...xBBBBBBx...', '...xBBBBBBx...', '...xxxxxxxx...', '...xxxSSxxx...', '...xxxxxxxx...'], 1, 2),
  island: pic(['....gg.gg.....', '...gGGgGGg....', '..g..gNg..g...', '......N.......', '......N.......', '.......N......', '.......N......', '....mmmNmmm...', '..mmmmmmmmmmm.', 'BBBBBBBBBBBBBB', 'bbbbbbbbbbbbbb'], 1, 2),
  'face-a': face(t => { t.rect(6, 8, 4, 5, P.x); t.rect(7, 11, 2, 1, P.p); }),
  'face-i': face(t => { t.rect(4, 9, 8, 2, P.x); t.rect(5, 9, 6, 1, P.w); t.px(3, 8, P.x); t.px(12, 8, P.x); }),
  'face-e': face(t => { t.rect(5, 9, 6, 3, P.x); t.rect(6, 9, 4, 1, P.w); }),
  'face-o': face(t => { t.rect(6, 8, 4, 4, P.x); t.px(6, 8, P.y); t.px(9, 8, P.y); t.px(6, 11, P.y); t.px(9, 11, P.y); t.rect(4, 3, 2, 1, P.N); t.rect(10, 3, 2, 1, P.N); }),
  'face-u': face(t => { t.rect(7, 9, 2, 2, P.x); t.px(6, 9, P.r); t.px(9, 9, P.r); t.px(6, 10, P.r); t.px(9, 10, P.r); t.rect(7, 8, 2, 1, P.r); t.rect(7, 11, 2, 1, P.r); }),
};
module.exports = { CUES };
if (require.main === module) { const dir = path.join(__dirname, 'cues'); fs.mkdirSync(dir, { recursive: true });
  for (const [id, g] of Object.entries(CUES)) fs.writeFileSync(path.join(dir, id + '.svg'), svg(g));
  console.log(Object.keys(CUES).length + ' cue icons'); }
