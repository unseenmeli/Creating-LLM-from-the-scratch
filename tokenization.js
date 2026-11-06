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
const t = 8;
const [x, y] = batching(trainData, 4, t);

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

const table2 = embeddingTable(t, 16);

function addPositions(alist) {
  const result = [];
  for (const items of alist) {
    const newlist = [];
    for (let count = 0; count < items.length; count++) {
      const row = [];
      for (let count1 = 0; count1 < 16; count1++) {
        row.push(items[count][count1] + table2[count][count1]);
      }
      newlist.push(row);
    }
    result.push(newlist);
  }
  return result;
}

const out = addPositions(embeddingLookup(x));

function matmul(alist, table) {
  const result = [];
  for (let count = 0; count < alist.length; count++) {
    const row = [];
    for (let count1 = 0; count1 < table[0].length; count1++) {
      let sum = 0;
      for (let count2 = 0; count2 < table.length; count2++) {
        sum = sum + alist[count][count2] * table[count2][count1];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

const embedSize = 16;
const numHeads = 2;
const headSize = embedSize / numHeads;

function matVec(vec, W) {
  const result = [];
  for (let j = 0; j < W[0].length; j++) {
    let sum = 0;
    for (let i = 0; i < vec.length; i++) {
      sum = sum + vec[i] * W[i][j];
    }
    result.push(sum);
  }
  return result;
}

function attentionScores(Q, K) {
  const result = [];
  for (let count = 0; count < Q.length; count++) {
    const row = [];
    for (let count1 = 0; count1 < K.length; count1++) {
      let sum = 0;
      for (let count2 = 0; count2 < Q[0].length; count2++) {
        sum = sum + Q[count][count2] * K[count1][count2];
      }
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

function divisionScores(table) {
  const result = [];
  for (const items of table) {
    const newlist = [];
    for (const numbers of items) {
      newlist.push(numbers / Math.sqrt(headSize));
    }
    result.push(newlist);
  }
  return result;
}

function casualMask(table) {
  const result = [];
  for (let count = 0; count < table.length; count++) {
    const newlist = [];
    for (let count1 = 0; count1 < table[0].length; count1++) {
      if (count < count1) {
        newlist.push(-Infinity);
      } else {
        newlist.push(table[count][count1]);
      }
    }
    result.push(newlist);
  }
  return result;
}

function maskedRowMax(table) {
  const result = [];
  for (const items of table) {
    let anum = -Infinity
    for (const each of items) {
      if (each > anum) {
        anum = each
      }
    }
    result.push(anum)
  }
  return result;
}

function subTr(table) {
  const maxes = maskedRowMax(table)
  const res = []
  for (let count = 0; count<table.length; count++) {
    let tempRes = []
    for (const items of table[count]) {
      tempRes.push(items - maxes[count])
    }
    res.push(tempRes)
  }
  return res;
}

function softmax(subtractedTable) {
  const res = []
  for (const items of subtractedTable) {
    let tempRes = []
    let total = 0
    for (const each of items) {
      total += Math.exp(each);
    }
    for (const each of items) {
      tempRes.push(Math.exp(each) / total)
    }
    res.push(tempRes)
  }
  return res; 
}

function attentionHead(seq, Wq, Wk, Wv) {
  const Q = matmul(seq, Wq);
  const K = matmul(seq, Wk);
  const V = matmul(seq, Wv);
  const scores = divisionScores(attentionScores(Q, K));
  const weights = softmax(subTr(casualMask(scores)));
  return matmul(weights, V);
}

const heads = [];
for (let h = 0; h < numHeads; h++) {
  heads.push({
    Wq: embeddingTable(embedSize, headSize),
    Wk: embeddingTable(embedSize, headSize),
    Wv: embeddingTable(embedSize, headSize),
  });
}

const Wo = embeddingTable(numHeads * headSize, embedSize);

function concatHeads(headOutputs) {
  const result = [];
  for (let pos = 0; pos < headOutputs[0].length; pos++) {
    let row = [];
    for (const headOut of headOutputs) {
      row = row.concat(headOut[pos]);
    }
    result.push(row);
  }
  return result;
}

function multiHeadAttention(seq) {
  const headOutputs = [];
  for (const head of heads) {
    headOutputs.push(attentionHead(seq, head.Wq, head.Wk, head.Wv));
  }
  return matmul(concatHeads(headOutputs), Wo);
}

function residualCon1(table1, table2) {
  const res = [];
  for (let count = 0; count<table1.length; count++) {
    const outer = [];
    for (let count1 = 0; count1<table1[0].length; count1++) {
      const inner = []
      for (let count2 = 0; count2<table1[0][0].length; count2++) {
        inner.push(table1[count][count1][count2] + table2[count][count1][count2])
      }
      outer.push(inner);
    }
    res.push(outer)
  }
  return res;
}

const gamma = [];
const beta = [];
for (let count = 0; count < 16; count++) {
  gamma.push(1)
  beta.push(0)
}

const mean = function(row) {
  let res = 0
  for (const each of row) {
    res += each;
  }
  res /= row.length;
  return res;
}

const variance = function(row, m) {
  let res = 0
  for (const each of row) {
    res += (each - m) * (each - m);
  }
  res /= row.length;
  return res;
}

const normalizeRow = function(row) {
  const m = mean(row);
  const v = variance(row, m);
  const result = [];
  for (const each of row) {
    result.push((each - m) / Math.sqrt(v + 0.00001));
  }
  return result;
}

function layerNorm(table, gamma, beta) {
  let res = [];
  for (const each of table) {
    let beforeTemp = []
    for (const components of each) {
      const normComp = normalizeRow([...components]);
      let temp = [];
      for (let count = 0; count < normComp.length; count++) {
        temp.push(normComp[count] * gamma[count] + beta[count]);
      }
      beforeTemp.push(temp)
    }
    res.push(beforeTemp);
  }
  return res;
}

const W1 = embeddingTable(16, 64);
const W2 = embeddingTable(64, 16);

let b1 = []
let b2 = []
for (let x = 1; x <= 64; x++) {
  b1.push(0)
  if (x % 4 == 0) {
    b2.push(0)
  }
}

const relu = function(row) {
  const res = []
  for (const items of row) {
    res.push(Math.max(0, items));
  }
  return res
}

const addBias = function(row, bias) {
  let res = []
  for (let count = 0; count < row.length; count++) {
    res.push(row[count] + bias[count]);
  }
  return res;
}

const feedForward = function(table) {
  const res = [];
  for (const seq of table) {
    const widened = matmul(seq, W1);
    const activated = [];
    for (const row of widened) {
      activated.push(relu(addBias(row, b1)));
    }
    const narrowed = matmul(activated, W2);
    const seqRows = [];
    for (const row of narrowed) {
      seqRows.push(addBias(row, b2));
    }
    res.push(seqRows);
  }
  return res;
}

const gamma2 = [];
const beta2 = [];
for (let count = 0; count < 16; count++) {
  gamma2.push(1);
  beta2.push(0);
}

function transformerBlock(table) {
  // Attention, then Add & Norm #1
  const mhaOut = table.map((seq) => multiHeadAttention(seq));
  const norm1 = layerNorm(residualCon1(table, mhaOut), gamma, beta);
  // Feed-forward, then Add & Norm #2
  const ffOut = feedForward(norm1);
  return layerNorm(residualCon1(norm1, ffOut), gamma2, beta2);
}

const blockOut = transformerBlock(out);

console.log(blockOut.length, blockOut[0].length, blockOut[0][0].length);
console.log(blockOut[0][0]);