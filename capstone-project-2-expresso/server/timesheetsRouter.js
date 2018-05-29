const timesheetsRouter = require('express').Router();
module.exports = timesheetsRouter;
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.get('/',(req,res,next)=>{
	const sql = "SELECT * FROM Timesheet WHERE employee_id = $id";
	const key = {$id:req.employee.id};
	db.all(sql,key,(error,rows)=>{
		if(error){next(error);}
		else {res.status(200).send({timesheets: rows});}
	});
});

timesheetsRouter.post('/',(req,res,next)=>{
	const hours = req.body.timesheet.hours,
	rate = req.body.timesheet.rate,
	date = req.body.timesheet.date,
	employeeId = req.employee.id;
	const sql = "INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date,$employeeId);";
	const key = {
		$hours: hours,
		$rate: rate,
		$date: date,
		$employeeId: employeeId
	};
	if(!hours||!rate||!date||!employeeId){res.status(400).send();}
	else {
		db.run(sql,key,function(error){
			if(error){next(error);}
			else {
				db.get("SELECT * FROM Timesheet WHERE id = $id",{$id:this.lastID}, (error,row)=>{
					if(error){next(error);}
					else {res.status(201).send({timesheet:row});}
				});
			};
		});
	};
});

timesheetsRouter.param('timesheetId', (req,res,next,timesheetId)=>{
	db.get("SELECT * FROM Timesheet WHERE id = $id",{$id:timesheetId}, (error,row)=>{
		if(error){next(error);}
		else if(row) {
			req.timesheet = row;
			next();
		}
		else {res.status(404).send();}
	})
});

timesheetsRouter.put('/:timesheetId',(req,res,next)=> {
	const hours = req.body.timesheet.hours,
		rate = req.body.timesheet.rate,
		date = req.body.timesheet.date,
		employeeId = req.employee.id,
		timesheetId = req.params.timesheetId;
	if (!hours||!rate||!date||!employeeId) {res.status(400).send();}
	else {
		const sql = "UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $id";
		const key = {
			$hours: hours,
			$rate: rate,
			$date: date,
			$employeeId: employeeId,
			$id: timesheetId
		};
		db.run(sql,key,(error)=> {
			if (error) {next(error);}
			else {
				db.get("SELECT * FROM Timesheet WHERE id = $id",{$id:req.params.timesheetId},(error,row)=>{
					if (error) {next(error);}
					else {
						res.status(200).send({timesheet:row});
					}
				});
			};
		});
	};
});

timesheetsRouter.delete('/:timesheetId',(req,res,next)=> {
	const sql = "DELETE FROM Timesheet WHERE id = $id;";
	const key = {$id:req.params.timesheetId};
	db.run(sql,key,(error)=>{
		if(error){next(error);}
		else{
			res.status(204).send();
		};
	});
});