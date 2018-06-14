function onEdit(e)
{ 
  var activeSheet = SpreadsheetApp.getActiveSheet().getName();
  switch(activeSheet) {
    case 'All Hymnals':
      allHymnals();
      break;
    case 'All Hymns':
      allHymns();
      break;
    default:
      singleHymnal();
      ;
  }  
}

function singleHymnal() {
  var thisHymnal = SpreadsheetApp.getActiveSheet().getName();
  var doneSongs = 0;
  var hymnNo = 0;
  var hymnrow = 2;
  var hymns = {};
  var hymnTitles = {};
  while(hymnNo !== '') {
   hymnNo = SpreadsheetApp.getActiveSheet().getRange(hymnrow, 1).getValue();
    hymnrow++;
    doneSongs++;
  }
  
  var numrows = doneSongs + 1;
  var updated = SpreadsheetApp.getActiveSheet().getRange(numrows+2, 2).getValue();
  
  if(updated === 0)return;
  var titlesrow = 1;
  var titlecolumn = 2;
  var titleElement = '...';
  var hymnals = [];
  var titles = [];
    
  while(titleElement !== '') {
   titleElement = SpreadsheetApp.getActiveSheet().getRange(titlesrow, titlecolumn++).getValue();
    titles.push(titleElement);
  }
  titles.pop(); // why this line?
  SpreadsheetApp.getActiveSheet().getRange(11,6).setValue(thisHymnal);
  SpreadsheetApp.getActiveSheet().getRange(11,6).setValue(JSON.stringify(titles));
  
  var row, i, j, k;
  row = 2;
  row--;  
  
  while(++row < numrows) {
    hymns[row - 1] = {};
    
    // search along the length
    var sometxt = SpreadsheetApp.getActiveSheet().getRange(row, 1).getValue();
    hymns[row - 1]["id"] = sometxt;
    hymnTitles[sometxt] = SpreadsheetApp.getActiveSheet().getRange(row, 2).getValue();
    i = 1;
    var more = [];
    while(sometxt !== '' ) {
      sometxt = SpreadsheetApp.getActiveSheet().getRange(row, ++i).getValue();
      if(titles[i-2] !== undefined)
        hymns[row - 1][titles[i-2]] = sometxt;
      else
        more.push(sometxt)
    }
    more.pop();
    var numStanzas = hymns[row - 1].stanzas;
    hymns[row - 1].stanzas = {};
    var numMore = more.length;
    
    for(i in more) {
      i = parseInt(i);
      more[i] = more[i].replace(/(?:\r\n|\r|\n)/g, '\r\n');
      // for strings that already had newline replaced
      more[i] = more[i].replace(/\\r/g, '\r');
      more[i] = more[i].replace(/\\n/g, '\n');
    }
    var reversedMore = JSON.parse(JSON.stringify(more)); // a better way of doing this?
    reversedMore = reversedMore.reverse();
    
    for(j = 0; j < numStanzas; j++) {
      hymns[row - 1].stanzas[j+1] = more[j];
      reversedMore.pop();
    }
    
    hymns[row - 1].choruses = {};
    more = reversedMore.reverse();
    
    for(j in more) {
      j = parseInt(j);
      hymns[row - 1].choruses[j+1] = more[j];
    }
  }
  
  // get other hymnals...
  var ret = {};
  ret["songs"] = hymns;
  ret["titles"] = hymnTitles;
  
  var idSheet = SpreadsheetApp.getActive().getSheetByName('All Hymnals');
  var id;
  function searchid(idSheet){
    var namesColumn = 5;
    var namesRow = 2;
    var numSongsColumn = 9;
    var lastName, numSongs;
    var name = idSheet.getRange(namesRow++,namesColumn).getValue();
    if(name === thisHymnal) id = namesRow;
    while(name !== '') {
      name = idSheet.getRange(namesRow++,namesColumn).getValue();
      if(name ===  thisHymnal) {
        lastName = name;
        name = '';
        id = namesRow;
        numSongs = idSheet.getRange(namesRow,numSongsColumn).getValue();
      }
    }
    id -= 3;
    ret["id"] = id;
    ret["NumSongs"] = numSongs;
    SpreadsheetApp.getActiveSheet().getRange(13,6).setValue(name);
    SpreadsheetApp.getActiveSheet().getRange(14,6).setValue(id);
    SpreadsheetApp.getActiveSheet().getRange(15,6).setValue(lastName);
    
  }
  
  searchid(idSheet)
  ret = encodeURIComponent(JSON.stringify(ret));
  var cellFunction = '=importxml("https://gospelsounders.org/hymnals/'+thisHymnal+'/'+ret+'","//@q")';
  SpreadsheetApp.getActiveSheet().getRange(numrows+3,1).setValue(cellFunction);
  
  updated = 0;
  SpreadsheetApp.getActiveSheet().getRange(numrows+2, 2).setValue(updated);
}

function allHymns() {
  var titlesrow = 1;
  var titlecolumn = 3;
  var titleElement = '...';
  var hymnals = [];
  var titles = [];
  while(titleElement !== '') {
   titleElement = SpreadsheetApp.getActiveSheet().getRange(titlesrow, titlecolumn++).getValue();
    titles.push(titleElement);
  }
  titles.pop(); // why this line?
  SpreadsheetApp.getActiveSheet().getRange(4,16).setValue(JSON.stringify(titles));
  
  var numHymns = 0;
  var hymnNo = 0;
  var hymnrow = 3;
  var hymns = {};
  while(hymnNo !== '') {
   hymnNo = SpreadsheetApp.getActiveSheet().getRange(hymnrow, 1).getValue();
    numHymns++;
    hymnrow++;
  }
  numHymns--;  
  var numrows = numHymns + 2;
  var updated = SpreadsheetApp.getActiveSheet().getRange(numrows+3, 2).getValue();
  if(updated === 0)return;
  
  var row, i, j, k;
  row = 3;
  row--;
  while(++row <= numrows) {
    hymns[row - 3] = {};
    for(i in titles) {
      i = parseInt(i);
      hymns[row - 3][titles[i]] = SpreadsheetApp.getActiveSheet().getRange(row, i+3).getValue();
    }
  }
  allHymns = encodeURIComponent(JSON.stringify(hymns))
  var cellFunction = '=importxml("https://gospelsounders.org/allhymns/'+allHymns+'","//@q")';
  SpreadsheetApp.getActiveSheet().getRange(numrows+4,1).setValue(cellFunction);
  
  updated = 0;
  SpreadsheetApp.getActiveSheet().getRange(numrows+3, 2).setValue(updated);
  
}

function allHymnals() {
  var titlesrow = 1;
  var titlecolumn = 1;
  var titleElement = '...';
  var hymnals = [];
  var titles = [];
  while(titleElement !== '') {
   titleElement = SpreadsheetApp.getActiveSheet().getRange(titlesrow, titlecolumn++).getValue();
    titles.push(titleElement);
    
  }
  getHymnals(titles);
}

function getHymnals(titles) {
  var i,j,k;
  var allhymnals = [];
  var hymnal = [];
  var numrows = 1;
  var rowid = '...';
  i = 0;
  while(rowid !== '') {
   rowid = SpreadsheetApp.getActiveSheet().getRange(++i, 1).getValue();
  }
  
  numrows = i - 1;
  
  var updated = SpreadsheetApp.getActiveSheet().getRange(numrows+5, 2).getValue();
  if(updated === 0)return;
  
  for(i = 2; i<=numrows; i++) {
    var id = SpreadsheetApp.getActiveSheet().getRange(i, 1).getValue();
    
    hymnal[i-2] = {};
    for(j in titles) {
      j = parseInt(j);
      
      var title = titles[j];
      hymnal[i-2][titles[j]] =  SpreadsheetApp.getActiveSheet().getRange(i, j+1).getValue();//get the id
            
    }
    
  }
  allhymnals = hymnal;
  var defaulthymnal = SpreadsheetApp.getActiveSheet().getRange(numrows+3, 2).getValue();
  var interval = SpreadsheetApp.getActiveSheet().getRange(numrows+4, 2).getValue();
  hymnal = {
    "hymnals":allhymnals,
    "default":defaulthymnal,
    "Interval":interval
  };
  SpreadsheetApp.getActiveSheet().getRange(1,13).setValue(JSON.stringify(hymnal));
  var tmp = encodeURIComponent(JSON.stringify(hymnal));
  SpreadsheetApp.getActiveSheet().getRange(2,13).setValue(tmp);
  
  var cellFunction = '=importxml("https://gospelsounders.org/index/'+tmp+'","//@q")';
 
  SpreadsheetApp.getActiveSheet().getRange(3,13).setValue(cellFunction);
  updated = 0;
  SpreadsheetApp.getActiveSheet().getRange(numrows+5, 2).setValue(updated);
  return hymnal;
  
           
}