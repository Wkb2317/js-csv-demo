import neatCsv from 'neat-csv';
import {Parser}  from "json2csv"
import fs from 'fs';

// 取文件夹下的文件
function getFilesName(filename) {
	return fs.readdirSync(`./${filename}`, (err, files) => {
		if (err) return;
		console.log(files);
		return files;
	});
}

// buffer转换成json的同步函数
async function bufferToJson(data) {
	let jsondata = await neatCsv(data);
	return jsondata;
}

// 取文件夹下的csv数据 函数
async function getFilesData(filesName, dataStrage, type) {
	for (let i = 0; i < filesName.length; i++) {
		// 读取data文件夹下的csv
		const buffer = fs.readFileSync(`./${type}/${filesName[i]}`, (err, data) => {
			if (err) {
				console.error(err);
				return;
			}
			return data;
		});
		let data = await bufferToJson(buffer);
		dataStrage.push({ name: filesName[i], data });
	}
}

// 84坐标替换原始坐标函数
function replace(prevData,nextData){
  prevData.forEach((file,fileIndex) => {
    if(file.data.length != 0){
      file.data.forEach((item,dataIndex)=>{
        item.lon_bd = nextData[fileIndex]["data"][dataIndex]["����"];   // 经度   （ 读中文出现乱码，才用此拙劣的办法）
        item.lat_bd = nextData[fileIndex]["data"][dataIndex]["γ��"];   //  纬度
      })
    }
  });
}

//  定义保存数据的变量
let originalData = []; // 原文件 数据
let data_84 = []; //  84坐标数据

// 拿到data目录下的所有文件名
let originalFilesName = getFilesName('input');
let files84Name = getFilesName('84point');

// 调用取数据函数  
await getFilesData(originalFilesName, originalData, 'input'); // 取出原始数据（input文件夹下）
await getFilesData(files84Name, data_84, '84point'); //  取出的84坐标数据（84point文件夹下）

// 调用替换函数
replace(originalData,data_84);

// 输出
const json2csvParser = new Parser();
originalData.forEach((item)=>{
	let csv = json2csvParser.parse(item.data);
	fs.writeFileSync(`./output/${item.name}.csv`,csv);
	console.log(item.name + "  文件处理成功  ");
})
