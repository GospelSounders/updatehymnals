const fse = require('fs-extra');

fse.readFile(`./NZK.resource`, 'utf8')
  .then(filecontents => {
    // let hymnalstr = tmp[1];
    let hymnalstr = filecontents
    // console.log(hymnalstr)

    // let titles = hymnalstr.match(/\(NK \d+.(.)*/g);
    let firstlines = hymnalstr.match(/\(NK #(\D)+\d+\).*/g);
    let hymns = {}
    for(let i in firstlines) {
    	let line = firstlines[i]
    	let hymnNo = line.match(/# \d+\)/g)[0].match(/\d+/)[0]
    	// console.log(hymnNo)
    	// console.log(line)
    	hymns[parseInt(hymnNo)-1] = {}
    	hymns[parseInt(hymnNo)-1].title = line.replace(/\(NK #(\D)+\d+\)/g, '')
    	// console.log(hymns[parseInt(hymnNo)-1].title)
    }

    //number of stanzas
    let tmphymns = hymnalstr.split(/\(NK #(\D)+\d+\).*/g);
    let tmphymns1 = [];
    // console.log(firstlines)
    for(let i in tmphymns) {
    	if(tmphymns[i].length > 8)
    		tmphymns1.push(tmphymns[i]);
    }
    tmphymns = tmphymns1
    // get number of stanzas
    for(let i in tmphymns) {
    	let numstanzas = tmphymns[i].match(/\d/g)
    	if(numstanzas === null) numstanzas = 1;
    	numstanzas = numstanzas.length || 1
    	hymns[i].numstanzas = numstanzas

    	// get actual stanzas
    	let tmpstanzas = tmphymns[i].split(/\d/g)
    	if(tmpstanzas.length > 1){
    		tmpstanzas.reverse().pop()
    		tmpstanzas.reverse()
    		for(let j in tmpstanzas){
    			tmpstanzas[j] = tmpstanzas[j].slice(1).trim()
    			// tmpstanzas[j] = tmpstanzas[j].replace(/\./)
    		}
    		hymns[i].stanzas = tmpstanzas
    	}else{
    		let tmp = tmpstanzas[0]
    		tmp = tmp.split(/\n/).reverse()
    		tmp.pop()
    		tmp.pop()
    		tmp.reverse()
    		let tmp1 = []
    		for(let j in tmp){
    			if(tmp[j].length > 4)tmp1.push(tmp[j])
    		}
    		tmp = [tmp1.join('\n').trim()]
    		hymns[i].stanzas = tmp
    		// console.log(hymns[i].stanzas)
    		// console.log(tmp)
    	}

    	// get choruses, assume a single chorus for each song


    	let numlines;
    	if(hymns[i].numstanzas > 1) {
    		let firststanzanumlines = hymns[i].stanzas[0].split(/\n/).length
    		let secondstanzanumlines = hymns[i].stanzas[1].split(/\n/).length
    		if(firststanzanumlines > secondstanzanumlines){
    			let firststanza = []
    			let chorus = []
    			let firststanzalines = hymns[i].stanzas[0].split(/\n/);
    			// console.log(`${}`)
    			for(let j in firststanzalines) {
    				if(j<secondstanzanumlines){
    					firststanza.push(firststanzalines[j])
    					
    				}else chorus.push(firststanzalines[j])
    			}

    			hymns[i].choruses = [chorus.join('\n')]
    			hymns[i].stanzas[0] = firststanza.join('\n')
    			// console.log(`${firststanzanumlines}:${secondstanzanumlines} for ${hymns[i].title}`)
    			// console.log(hymns[i].stanzas[1])
    		}

    	}

    	
    	
    }

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
		line += hymn.numstanzas + '|';

		for(let j in hymn.stanzas) {
			let stanza = hymn.stanzas[j]
			stanza = stanza.replace(/\r|\n/g, '#n#')
			line += stanza + '|';
		}

		for(let j in hymn.choruses) {
			let chorus = hymn.choruses[j]
			chorus = chorus.replace(/\r|\n/g, '#n#').trim()
			line += chorus + '|';
			// console.log(stanza)
		}

	

		csv.push(line);
		
	}
	fse.writeFile("./NZK.csv", csv.join('\r\n'), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log(csv)
      console.log(csv.length)
      console.log('saved file')
    });

})

