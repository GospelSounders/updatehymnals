const fse = require('fs-extra');

fse.readFile(`./HGPP1849.resource`, 'utf8')
  .then(filecontents => {
    // console.log(filecontents)
    let tmp = filecontents.split('STARTHYMNAL');
    let hymnalstr = tmp[1];
    // console.log(hymnalstr)

    let titles = hymnalstr.match(/HYMN \d+.(.)*/g);
    // console.log(titles)


    let hymnswithoutfullstops = []
    let tmphymns;
    let hymns = hymnalstr.split(/HYMN \d+.(.)*\n/g);
    
    for(let i in hymns) {
    	let hymn = hymns[i]
    	if(hymn.length > 5)hymnswithoutfullstops.push(hymn)
    }
    tmphymns = hymnswithoutfullstops
	// console.log(tmphymns)

	let stanzanums = []
	hymns = {}
	for(let i in tmphymns){
		// get numstanzas
		hymns[i] = {}
		let hymn = tmphymns[i]
		let tmp = hymn.match(/\d/g);
		if(tmp !== null){
			tmp = tmp.filter(function(x) {
			    return x > 0;
			});
			stanzanums.push(tmp)
			hymns[i].stanzanums = tmp
		} else {
			stanzanums.push([1])
			hymns[i].stanzanums = [1];
		}
	}

	// console.log(hymns)
	for(let i in tmphymns){
		let hymn = tmphymns[i]

		let tmp = hymn.match(/DOUBLE CHORUS\.(\D|(\r\n|\r|\n))*/g);
		// console.log(tmp)
		// console.log(hymn)
		if(tmp !== null) {
			hymns[i].doublechoruses = tmp
			hymns[i].numdoublechoruses = tmp.length || 0
			tmphymns[i] = tmphymns[i].replace(/DOUBLE CHORUS\.(\D|(\r\n|\r|\n))*/g,'');
		} else {
			hymns[i].numdoublechoruses = 0
		}

		hymn = tmphymns[i]
		tmp = hymn.match(/CHORUS\.(\D|(\r\n|\r|\n))*/g);
		// console.log(tmp)
		if(tmp !== null) {
			hymns[i].choruses = tmp
			hymns[i].numchoruses = tmp.length || 0
			tmphymns[i] = tmphymns[i].replace(/CHORUS\.(\D|(\r\n|\r|\n))*/g,'');
		} else {
			hymns[i].numchoruses = 0;
		}
		
	}
	for(let i in titles){
		title= titles[i]
		title = title.match(/ (\D)*/g);
		title = title[1].slice(1)
		hymns[i].title = title
	}

	// add the text for the stanzas
	for(let i in tmphymns){
		let hymn = tmphymns[i]
		let tmp = hymn.match(/\d\.(\D)*/g);
		let tmp1;
		let tmpstanzas = []
		for(let j in tmp) {
			// console.log(tmp[j])
			tmp1 = tmp[j].match(/\. (\D)*/g)[0].slice(2);
			// console.log(tmp1)
			tmpstanzas.push(tmp1);
		}
		hymns[i].stanzas = tmpstanzas
		// tmp = tmp.match(/\. (\D)*/g);
		// console.log(tmp)
		
	}
	// save into csv
	// add other correct details about the hymnal...


    
	// console.log(hymns)
	let csv = []
	csv.push(`Number|title|author|key|stanzas`)
	for(let i in hymns){
		let hymn = hymns[i]
		let line = '';
		line += parseInt(i)+1 + '|';
		line += hymn.title + '|';
		line += (hymn.author || '') + '|';
		line += (hymn.key || '') + '|';
		line += hymn.stanzanums.length + '|';
		// hymns[i].stanzas = tmpstanzas
		// tmp = tmp.match(/\. (\D)*/g);
		
		// for(let j in hymn.stanzas) {
		// 	let stanza = hymn.stanzas[j]
		// 	// stanza = stanza.replace(/\r|\n/g, '#n#')
		// 	stanza = stanza.replace(/\r|\n/g, '#n#')
		// 	line += stanza + '|';
		// 	// console.log(stanza)
		// }

		for(let j in hymn.stanzas) {
			let stanza = hymn.stanzas[j]
			// stanza = stanza.replace(/\r|\n/g, '#n#')
			stanza = stanza.replace(/\r|\n/g, '#n#')
			line += stanza + '|';
			// console.log(stanza)
		}

		for(let j in hymn.choruses) {
			let chorus = hymn.choruses[j]
			console.log('CHORUS FOUND....')
			console.log(chorus)
			chorus = chorus.replace(/CHORUS\./g,'');
			console.log(chorus)
			chorus = chorus.replace(/\r|\n/g, '#n#').slice(3)
			console.log(chorus)
			line += chorus + '|';
			// console.log(stanza)
		}

		for(let j in hymn.doublechoruses) {
			let chorus = hymn.doublechoruses[j]
			chorus = chorus.replace(/DOUBLE CHORUS\./g,'');
			chorus = chorus.replace(/\r|\n/g, '#n#').slice(3)
			line += chorus + '|';
		}

		csv.push(line);
		//console.log(line)
		
	}
	fse.writeFile("./HGPP1849.csv", csv.join('\r\n'), function(err) {
      if(err) {
          return console.log(err);
      }
      // console.log(csv)
      // console.log(csv.length)
      // console.log('saved file')
    });

})

