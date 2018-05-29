const menuItemsRouter = require('express').Router();
module.exports = menuItemsRouter;
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/',(req,res,next)=>{
	const sql = "SELECT * FROM MenuItem WHERE menu_id = $id;";
	const key = {$id:req.menu.id};
	db.all(sql,key,(error,rows)=>{
		if(error){next(error);}
		else {res.status(200).send({menuItems:rows});}
	});
});

menuItemsRouter.post('/', (req,res,next)=>{
	const name = req.body.menuItem.name,
	description = req.body.menuItem.description,
	inventory = req.body.menuItem.inventory,
	price = req.body.menuItem.price,
	menuId = req.menu.id;
	const sql = "INSERT INTO MenuItem (name, description,inventory,price,menu_id)"+
	"VALUES ($name,$description,$inventory,$price,$menuId)";
	const key = {
		$name: name,
		$description: description,
		$inventory: inventory,
		$price: price,
		$menuId: menuId
	};
	if (!name||!description||!inventory||!price||!menuId) {res.status(400).send();}
	else {
		db.run(sql,key,function(error){
			if (error){next(error);}
			else {
				db.get("SELECT * FROM MenuItem WHERE id = $id", {$id:this.lastID},(error,row)=>{
					if(error){next(error);}
					else{res.status(201).send({menuItem:row});}
				});
			};
		});
	};
});

menuItemsRouter.param('menuItemId', (req,res,next,menuItemId)=>{
	db.get("SELECT * FROM MenuItem WHERE id = $id", {$id:menuItemId}, (error,row)=>{
		if(error){next(error);}
		else if(!row) {res.status(404).send()}
		else {
			req.menuItem = row;
			next();
		};
	});
});


menuItemsRouter.put('/:menuItemId', (req,res,next)=>{
	const name = req.body.menuItem.name,
	description = req.body.menuItem.description,
	inventory = req.body.menuItem.inventory,
	price = req.body.menuItem.price,
	menuId = req.menu.id,
	id = req.params.menuItemId;
	const sql = "UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory," +
	 "price = $price, menu_id = $menuId WHERE id = $id;";
	const key = {
		$name: name,
		$description: description,
		$inventory: inventory,
		$price: price,
		$menuId: menuId,
		$id: id
	};
	if (!name||!description||!inventory||!price||!menuId||!id) {res.status(400).send();}
	else {
		db.run(sql,key,(error)=>{
			db.get("SELECT*FROM MenuItem WHERE id =$id",{$id:id}, (error,row)=>{
				if (error){next(error);}
				else {res.status(200).send({menuItem:row});}
			});
		});
	};
});

menuItemsRouter.delete('/:menuItemId', (req,res,next)=>{
	db.run("DELETE FROM MenuItem WHERE id = $id",{$id:req.params.menuItemId}, (error)=>{
		if(error) {next(error);}
		else {res.status(204).send();}
	});
});













