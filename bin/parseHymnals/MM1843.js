const fse = require('fs-extra');

// read directories
fse
.readdirSync('./MM1843')
.filter((modelfile) =>
	modelfile !=='index.js'
)
.forEach((file)=>{
	console.log(file)
	fse
	.readFile(`./MM1843/${file}`, 'utf8')
	.then(filecontents => {
		console.log(filecontents)

		process.exit();
	});

	// try
	// {
	// 	let model = sequelize.import(path.join(appFolder, modelfile))
	// 	db[model.name] = model
	// }catch(error)
	// {
	// 	console.log(`error reading model: ${error} for ${modelfile}`)
	// }		
})