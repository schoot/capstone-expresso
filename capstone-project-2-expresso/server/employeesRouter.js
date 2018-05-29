const employeesRouter = require('express').Router();
module.exports = employeesRouter;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.get('/', (req,res,next) => {
	const sql = "SELECT * FROM Employee WHERE is_current_employee = 1;";
	db.all(sql, (error,rows) => {
		if (error) {next(error);}
		else {res.status(200).send({employees:rows});}
	});
});

employeesRouter.post('/', (req,res,next) => {
	const name = req.body.employee.name,
		position = req.body.employee.position,
		wage = req.body.employee.wage;
	if (!name || !position || !wage) {res.status(400).send();}
	else {
		const sql = "INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage);";
		const key = {
			$name: name,
			$position: position,
			$wage: wage
		};
		db.run(sql,key, function(error){
			if(error) {next(error);}
			else {
				db.get("SELECT * FROM Employee WHERE id = $id;", {$id:this.lastID}, (error,row) => {
					if(error){next(error);}
					else{res.status(201).send({employee: row});}
				});
			};
		});
	};
});

employeesRouter.param('employeeId', (req,res,next,employeeId)=> {
	const sql = "SELECT * FROM Employee WHERE id = $id";
	const key = {$id: employeeId};
	db.get(sql,key,(error,row) =>{
		if(error){next(error);}
		else{
			if (row) {
				req.employee = row;
				next();
			}
			else {res.status(404).send();}
		};
	});
});

employeesRouter.get('/:employeeId', (req,res,next)=> {
	db.get("SELECT * FROM Employee WHERE id = $id;",{$id:req.params.employeeId},(error,row)=>{
		if (error) {next(error);}
		else {res.status(200).send({employee:row});};
	});
});

employeesRouter.put('/:employeeId', (req,res,next) => {
	const name = req.body.employee.name,
	position = req.body.employee.position,
	wage = req.body.employee.wage,
	id = req.employee.id;
	if (!id||!name||!position||!wage) {res.status(400).send();}
	else {
		const sql = "UPDATE Employee SET name = $name, position = $position, wage = $wage";
		const key = {
			$name: name,
			$position: position,
			$wage: wage
		};
		db.run(sql,key,(error)=> {
			if(error){next(error);}
			else {
				db.get("SELECT * FROM Employee WHERE id = $id;",{$id:id}, (error,row)=>{
					if(error){next(error);}
					else{
						res.status(200).send({employee:row});
					};
				});
			};
		});
	};
});

employeesRouter.delete('/:employeeId', (req,res,next)=> {
	const sql = "UPDATE Employee SET is_current_employee = 0 WHERE id =$id";
	const key = {$id:req.params.employeeId};
	db.run(sql,key,(error)=> {
		if(error){next(error);}
		else {
			db.get("SELECT * FROM Employee WHERE id =$id", {$id:req.params.employeeId},(error,row)=>{
				if(error) {next(error);}
				res.status(200).send({employee:row});
			});
		};
	});
});

const timesheetsRouter = require('./timesheetsRouter.js');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);
module.exports = employeesRouter;
