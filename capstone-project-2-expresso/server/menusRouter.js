const menusRouter = require('express').Router();
module.exports = menusRouter;
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.get('/',(req,res,next)=>{
	db.all("SELECT * FROM Menu",(error,rows)=>{
		if(error){next(error);}
		else {
			res.status(200).send({menus:rows});
		};
	});
});

menusRouter.post('/',(req,res,next)=>{
	const title = req.body.menu.title;
	const sql = "INSERT INTO Menu (title) VALUES ($title);";
	const key = {$title: title};
	if (!title) {res.status(400).send();}
	else {
		db.run(sql,key,function(error){
			if (error){next(error);}
			else {
				db.get("SELECT * FROM Menu WHERE id = $id",{$id:this.lastID}, (error,row)=>{
					if (error){next(error);}
					else {
						res.status(201).send({menu:row});
					}
				});
			};
		});
	}
	
});

menusRouter.param('menuId', (req,res,next,menuId)=>{
	db.get("SELECT * FROM Menu WHERE id = $id",{$id:menuId},(error,row)=>{
		if(error){next(error);}
		else if (row) {
			req.menu = row;
			next();
		} else {
			res.status(404).send();
		}
	});
});

menusRouter.get('/:menuId',(req,res,next)=>{
	res.status(200).send({menu:req.menu});
});

menusRouter.put('/:menuId', (req,res,next)=>{
	const title = req.body.menu.title;
	const sql = "UPDATE Menu SET title = $title WHERE id = $id;";
	const key = {$title: title, $id: req.params.menuId};
	if(!title) {res.status(400).send();}
	else {
		db.run(sql,key,(error)=>{
			if(error){next(error);}
			else {
				db.get("SELECT * FROM Menu WHERE id = $id", {$id:req.params.menuId}, (error,row)=>{
					res.status(200).send({menu:row})
				});
			};
		});
	};
});

menusRouter.delete('/:menuId', (req,res,next)=>{
	db.get("SELECT * FROM MenuItem WHERE menu_id = $id",{$id:req.params.menuId}, (error,row)=>{
		if (error) {next(error);}
		else if (row) {res.status(400).send();}
		else {
			const sql = "DELETE FROM Menu WHERE id = $id";
			const key = {$id: req.params.menuId};
			db.run(sql,key,(error)=>{
				if(error){next(error);}
				else {
					res.status(204).send();
				};
			});
		}
	});
});


const menuItemsRouter = require('./menuItemsRouter.js');
menusRouter.use('/:menuId/menu-items', menuItemsRouter);
module.exports = menusRouter;