const atext =
  "A SENTIMENTAL STORY FROM THE DIARY OF A DREAMEBFIRST NIGHT IT was a wonderful night, such a night as is only possible whenwe are young, dear reader. The sky was so starry, so brightthat, looking at it, one could not help asking oneself whetherill-humoured and capricious people could live under such a sky.That is a youthful question too, dear reader, very youthful, butmay the Lord put it more frequently into your heart ! . . . Speaking of capricious and ill-humoured people, I cannot helprecalling my moral condition all that day. From early morningI had been oppressed by a strange despondency. It suddenlyseemed to me that I was lonely, that every one was forsaking meand going away from me. Of course, any one is entitled to askwho ' every oiifi^_jras. For though I had been living almosteight years in Petersburg I had hardly an acquaintance . But whatdid I want with acquaintances ? I was acquainted with all Peters-burg as it was ; that was why I felt as though they were alldeserting me when all Petersburg packed up and went to itssummer villa. I felt afraid of being left alone, and for three wholedays I wandered about the town in profound dejection, not knowing what to do with myself. Whether I walked in the Nevsky,went to the Gardens or sauntered on the embankment, there wasnot one face of those I had been accustomed to meet at the sametime and place all the year. They, of course, do not know me,but I know them. I know them intimately, I have almost madea study of their faces, and am delighted when they are gay, anddowncast when they are under a cloud. I have almost struckup a friendship with one old man whom I meet every blessed day,at the same hour in Fontanka. Such a grave, pensive countenance ; he is alway whispering to himself and brandishing ";

function findUniq(atext) {
  const antiduplarr = [...new Set(atext)].sort();
  return antiduplarr;
}

const chars = findUniq(atext);

const charToID = new Map();
let count = 0;
for (const items of chars) {
  charToID.set(items, count);
  count = count + 1;
}

function encoding(atext) {
  const alist = [];
  for (const items of atext) {
    alist.push(charToID.get(items));
  }
  return alist;
}

function decoding(alist) {
  const collect = [];
  for (const items of alist) {
    collect.push(chars[items]);
  }
  return collect.join("");
}

const data = encoding(atext);

const n = Math.floor(data.length * 0.9);
const trainData = data.slice(0, n);
const valData = data.slice(n);

function batching(data, snippetCount, snippetLen) {
  const x = [];
  const y = [];
  for (let b = 0; b < snippetCount; b++) {
    const start = Math.floor(Math.random() * (data.length - snippetLen));
    x.push(data.slice(start, start + snippetLen));
    y.push(data.slice(start + 1, start + snippetLen + 1));
  }
  return [x, y];
}

const [x, y] = batching(trainData, 4, 8);

function embeddingTable(rows, listNum) {
  const alist = [];
  for (let count = 0; count < rows; count++) {
    let newlist = [];
    for (let count1 = 0; count1 < listNum; count1++) {
      newlist.push((Math.random() - 0.5) * 0.2);
    }
    alist.push(newlist);
  }
  return alist;
}

const table1 = embeddingTable(chars.length, 16);

function embeddingLookup(x) {
  const result = [];
  for (const items of x) {
    const newlist = [];
    for (const subjects of items) {
      newlist.push([...table1[subjects]]);
    }
    result.push(newlist);
  }
  return result;
}

console.log(embeddingLookup(x));
