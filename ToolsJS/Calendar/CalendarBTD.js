/**
* CalendarBTD
* 
* @author     banhthidiem <banhthidiem@gmail.com>
* @copyright  2010 Bach Khoa Computer Inc.
* @version    1.0 21/04/2010
*/

var EventNameCalendar =
{
	/******* Event Name of DropDownList *******/
	click: "click",
	blur: "blur",
	focus: "focus",
	change: "change",

	/******* Event Name of Item DropDownList *******/
	itemClick: "itemClick",
	itemMouseOver: "itemMouseOver",
	itemMouseMove: "itemMouseMove",
	itemMouseOut: "itemMouseOut"
};

var DayOfWeekBTD = ["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"];
var MonthBTD = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

CalendarBTD = function (idParent, myName, myStyle, isShowLunarCalendar, textPlaceholder) {
	if (idParent == null) return;
	this.myName = myName;
	this.isShowing = false;
	this.isShowingMY = false;
	this.textPlaceholder = textPlaceholder;
	this.isBTD = true;
	this.isShowLunarCalendar = typeof isShowLunarCalendar == undefined ? false : isShowLunarCalendar;
	this.myStyle = typeof (myStyle) == "undefined" ? "" : myStyle;
	this.elContainer = null;
	this.elContainerList = null;
	this.elContainerMY = null;
	this.elContainerCalendar = null;
	this.elContainerTextDate = null;
	this.elCellDateSelected = null;
	this.elContainerParent = typeof (idParent) == "string" ? utilObj.getElById(idParent) : idParent;
	this.oldValue = "";
	this.listEvent = new Array();
	this.elMonthSelected = null;
	this.elYearSelected = null;
	this.yearView = 0;
	this.yearSelected = 0;

	/*************** Properties ******************/
	this.dateNow = new Date();
	this.dateView = null;
	this.dateSelected = null;
	/*************** Properties ******************/

	if (this.elContainerParent != null) this.createMain();

};

/*****************************************************************************
Create element in DropDownList Start
*****************************************************************************/

CalendarBTD.prototype.createMain = function() {
	try {
		this.createContainer();
		var self = this;
		utilObj.addEvent(document, "mousedown", function(e) { self.documentMouseDown(e); });
		utilObj.addEvent(window, "resize", function (e) {
			//self.hideList(e); 
		});
		utilObj.addEvent(document, "scroll", function(e) { self.hideList(e); });
	}
	catch (ex) { }
};

CalendarBTD.prototype.keyDownMY = function(e) {
	switch (e.keyCode) {
		case 37: // Left
			if (this.elYearSelected.parentNode == null) {
				this.loadChooseMY(this.yearView, this.yearView);
				return;
			}
			var cellIndexMax = this.elYearSelected.parentNode.rowIndex == 0 ? 1 : 0;
			if (this.elYearSelected.cellIndex == cellIndexMax) {
				this.yearView = this.elYearSelected.year - 6;
				this.loadChooseMY(this.yearView, this.yearView);
			}
			else {
				this.clickYearMY(e, this.elYearSelected.previousSibling);
			}
			break;
		case 39: // Right
			if (this.elYearSelected.parentNode == null) {
				this.loadChooseMY(this.yearView, this.yearView);
				return;
			}
			var cellIndexMax = this.elYearSelected.parentNode.rowIndex == 0 ? 5 : 4;
			if (this.elYearSelected.cellIndex == cellIndexMax) {
				this.yearView = this.elYearSelected.year + 6;
				this.loadChooseMY(this.yearView, this.yearView);
			}
			else {
				this.clickYearMY(e, this.elYearSelected.nextSibling);
			}
			break;
		case 38: // Up
			if (this.elYearSelected.parentNode == null) {
				this.loadChooseMY(this.yearView, this.yearView);
				return;
			}
			if (this.elYearSelected.parentNode.rowIndex == 0) {
				this.yearView = this.elYearSelected.year - 5;
				this.loadChooseMY(this.yearView, this.yearView);
			}
			else {
				this.clickYearMY(e,
					this.elYearSelected.parentNode.previousSibling.cells[this.elYearSelected.cellIndex + 1]);
			}
			break;
		case 40: // Down
			if (this.elYearSelected.parentNode == null) {
				this.loadChooseMY(this.yearView, this.yearView);
				return;
			}
			if (this.elYearSelected.parentNode.rowIndex == 1) {
				this.yearView = this.elYearSelected.year + 5;
				this.loadChooseMY(this.yearView, this.yearView);
			}
			else {
				this.clickYearMY(e,
					this.elYearSelected.parentNode.nextSibling.cells[this.elYearSelected.cellIndex - 1]);
			}
			break;
	}
};

CalendarBTD.prototype.keyDownCalendar = function(e) {
	if (this.dateSelected == null) {
		var mm = this.dateNow.getMonth() + 1;
		var yy = this.dateNow.getFullYear();
		var dd = this.dateNow.getDate();
		this.dateSelected = new Date(mm + "/" + dd + "/" + yy);
		this.loadCalendar(this.dateNow);
		return;
	}
	if (this.elCellDateSelected == null) {
		this.loadCalendar(this.dateSelected);
	}
	var elCell = this.elCellDateSelected;
	switch (e.keyCode) {
		case 37: // Left
			if (elCell.solarDate[0] == 1 && elCell.className.indexOf("dayNotInMonth", 0) == -1) {
				var mm = elCell.solarDate[1] == 1 ? 12 : elCell.solarDate[1] - 1;
				var yy = elCell.solarDate[1] == 1 ? elCell.solarDate[2] - 1 : elCell.solarDate[2];
				var dd = Date.maxDateInMonth(mm, yy);

				this.dateSelected = new Date(mm + "/" + dd + "/" + yy);
				this.loadCalendar(this.dateSelected);
				return;
			}
			if (elCell.cellIndex == 0) {
				this.selectDateByCell(elCell.parentNode.previousSibling.cells[6]);
			}
			else {
				this.selectDateByCell(elCell.previousSibling);
			}
			break;
		case 39: // Right
			if (elCell.solarDate[0] == Date.maxDateInMonth(elCell.solarDate[1], elCell.solarDate[2])) {
				var mm = elCell.solarDate[1] == 12 ? 1 : elCell.solarDate[1] + 1;
				var yy = elCell.solarDate[1] == 12 ? elCell.solarDate[2] + 1 : elCell.solarDate[2];
				var dd = 1;

				this.dateSelected = new Date(mm + "/" + dd + "/" + yy);
				this.loadCalendar(this.dateSelected);
				return;
			}
			if (elCell.cellIndex == 6) {
				this.selectDateByCell(elCell.parentNode.nextSibling.cells[0]);
			}
			else {
				this.selectDateByCell(elCell.nextSibling);
			}
			break;
		case 38: // Up
			var elCellPre = elCell.parentNode.previousSibling.cells[elCell.cellIndex];
			if (elCell.parentNode.rowIndex == 1 || elCellPre.className.indexOf("dayNotInMonth", 0) != -1) {
				var mm = elCell.solarDate[1] == 1 ? 12 : elCell.solarDate[1] - 1;
				var yy = elCell.solarDate[1] == 1 ? elCell.solarDate[2] - 1 : elCell.solarDate[2];
				var dd = Date.maxDateInMonth(mm, yy) - (7 - elCell.solarDate[0]);

				this.dateSelected = new Date(mm + "/" + dd + "/" + yy);
				this.loadCalendar(this.dateSelected);
				return;
			}
			this.selectDateByCell(elCellPre);
			break;
		case 40: // Down
			var nextRow = elCell.parentNode.nextSibling;
			if (elCell.parentNode.rowIndex == 6 ||
				(nextRow != null && nextRow.cells[elCell.cellIndex].className.indexOf("dayNotInMonth", 0) != -1)) {
				var mm = elCell.solarDate[1] == 12 ? 1 : elCell.solarDate[1] + 1;
				var yy = elCell.solarDate[1] == 12 ? elCell.solarDate[2] + 1 : elCell.solarDate[2];
				var dd = 7 - (Date.maxDateInMonth(elCell.solarDate[1], elCell.solarDate[2]) - elCell.solarDate[0]);

				this.dateSelected = new Date(mm + "/" + dd + "/" + yy);
				this.loadCalendar(this.dateSelected);
				return;
			}
			this.selectDateByCell(nextRow.cells[elCell.cellIndex]);
			break;
	}
};

CalendarBTD.prototype.documentKeyDown = function(e) {
	e = utilObj.getWindowEvent();
	switch (e.keyCode) {
		case 37: // Left
		case 38: // Up
		case 39: // Right
		case 40: // Down
			if (this.isShowing) {
				if (this.isShowingMY) {
					if (this.elYearSelected != null) {
						this.keyDownMY(e);
						utilObj.stopEvent();
					}
				}
				else {
					this.keyDownCalendar(e);
					utilObj.stopEvent();
				}
			}
			break;
		case 27: // Esc
			if (this.isShowingMY) {
				this.hideChooseMY(e);
			}
			else if (this.isShowing) {
				this.hideList(e);
			}
			break;
		case 13: // Enter
			if (this.isShowingMY) {
				this.clickBtnChooseMY(e);
			}
			else if (this.isShowing) {
				this.selectDate(e);
			}
			utilObj.stopEvent();
			break;
	}
	return false;
};

CalendarBTD.prototype.createContainer = function() {
	this.elContainer = utilObj.createEl("DIV");
	this.elContainer.id = "containerCalendar_" + this.myName;
	this.elContainer.className = "containerCalendar" + this.myStyle;
	this.elContainerParent.appendChild(this.elContainer);
	this.createTextBox();
	this.createButton();
	this.createContainerCalendar();
};

CalendarBTD.prototype.createTextBox = function () {
	var o = utilObj.createEl("INPUT");
	o.className = "displayText";
	o.readOnly = this.isTextBoxReadOnly;
	if (this.textPlaceholder != null && this.textPlaceholder != '') {
		o.placeholder = this.textPlaceholder;
	}
	o.nameCalendar = this.myName;
	var self = this;
	o["onmouseover"] = function (e) { self.mouseOver(e); };
	o["onmousedown"] = function (e) { self.showList(e); };
	o["onmouseout"] = function (e) { self.mouseOut(e); };
	o["onchange"] = function (e) { self.changeTextBox(e); };
	o["onfocus"] = function (e) { self.executeEvent(e, EventNameCalendar.focus); };
	o["onblur"] = function (e) { self.executeEvent(e, EventNameCalendar.blur); };
	this.oTextBox = o;
	this.elContainer.appendChild(o);
};

CalendarBTD.prototype.createButton = function() {
	var o = utilObj.createEl("DIV");
	o.className = "btn";
	o.nameCalendar = this.myName;
	var self = this;
	o["onmouseover"] = function(e) { self.mouseOver(e); };
	o["onmouseout"] = function(e) { self.mouseOut(e); };
	o["onclick"] = function(e) { self.mouseClick(e); };
	this.oBtn = o;
	this.elContainer.appendChild(o);
};

CalendarBTD.prototype.createContainerCalendar = function() {
	this.elContainerList = utilObj.createEl("DIV");
	this.elContainerList.className = "listDayCalendar";
	this.elContainerList.nameCalendar = this.myName;
	this.elContainerList.style.display = "none";
	this.elContainerList.style.top = "-1000px";
	this.elContainerList.style.left = "-1000px";
	this.elContainerList.style.zIndex = 11000;
	utilObj.addChildToBody(this.elContainerList);

	var self = this;
	utilObj.addEvent(this.elContainerList, "keydown", function(e) { self.documentKeyDown(e); });
	this.createContainerTable();
};

CalendarBTD.prototype.createContainerMY = function() {
	this.elContainerMY = utilObj.createEl("DIV");
	this.elContainerMY.className = "listDayCalendar chooseMY";
	this.elContainerMY.nameCalendar = this.myName;
	this.elContainerMY.style.display = "none";
	this.elContainerMY.style.top = "-1000px";
	this.elContainerMY.style.left = "-1000px";
	this.elContainerMY.style.zIndex = 11001;
	utilObj.addChildToBody(this.elContainerMY);

	var self = this;
	utilObj.addEvent(this.elContainerMY, "keydown", function(e) { self.documentKeyDown(e); });
};

CalendarBTD.prototype.loadChooseMY = function(yearView, yearSelected) {
	this.elContainerMY.innerHTML = "";
	var dateV = this.getDataView(false);
	this.yearView = yearView != null ? yearView : dateV.getFullYear();
	this.yearSelected = yearSelected != null ? yearSelected : dateV.getFullYear();
	this.createContainerTableMY(dateV.getMonth() + 1, this.yearView);

	if (this.elContainerMY.style.display == "") {
		this.elContainerMY.elFocus.focus();
	}
};

CalendarBTD.prototype.createContainerTableMY = function(monthSel, yearSel) {
	var elTable = utilObj.createEl("TABLE");
	elTable.className = "tableContainer";
	elTable.nameCalendar = this.myName;
	this.elContainerMY.appendChild(elTable);

	// Row month
	var elRow = elTable.insertRow(0);
	var elCell = elRow.insertCell(0);
	elCell.className = "cell";
	elCell.nameCalendar = this.myName;
	elCell.appendChild(this.createMonthMY(monthSel));

	// Row year
	elRow = elTable.insertRow(1);
	elCell = elRow.insertCell(0);
	elCell.className = "cell";
	elCell.nameCalendar = this.myName;
	elCell.appendChild(this.createYearMY(yearSel));

	// Row button
	elRow = elTable.insertRow(2);
	elCell = elRow.insertCell(0);
	elCell.className = "cell";
	elCell.nameCalendar = this.myName;
	elCell.appendChild(this.createBtnMY());
};

CalendarBTD.prototype.clickMonthMY = function(e, elCell) {
	if (this.elMonthSelected != null) this.elMonthSelected.className = "month";
	elCell.className = "monthSelected";
	this.elMonthSelected = elCell;
};

CalendarBTD.prototype.addEventClickMonthMY = function(elCell) {
	var self = this;
	utilObj.addEvent(elCell, "click", function(e) {
		self.clickMonthMY(e, elCell);
	});
};

CalendarBTD.prototype.createMonthMY = function(monthSelected) {
	var elTable = utilObj.createEl("TABLE");
	elTable.border = elTable.cellPadding = elTable.cellSpacing = 0;
	elTable.align = "center";
	elTable.style.padding = "10px";
	elTable.nameCalendar = this.myName;
	var count = 0;
	for (var i = 0; i < 3; i++) {
		var elRow = elTable.insertRow(i);
		for (var j = 0; j < 4; j++) {
			// Day Of Week
			var elCell = elRow.insertCell(j);
			elCell.className = "month";
			elCell.nameCalendar = this.myName;
			elCell.month = count + 1;
			elCell.innerHTML = MonthBTD[count];
			this.addEventClickMonthMY(elCell);
			count++;
			if (this.getDataView(false).getMonth() + 1 == elCell.month) {
				elCell.className = "monthSelected";
				this.elMonthSelected = elCell;
			}
		}
	}
	return elTable;
};

CalendarBTD.prototype.clickYearMY = function(e, elCell) {
	if (this.elYearSelected != null) this.elYearSelected.className = "year";
	elCell.className = "yearSelected";
	this.elYearSelected = elCell;
};

CalendarBTD.prototype.clickPreviousYearMY = function(e, elCell) {
	this.yearView = this.yearView - 10;
	this.loadChooseMY(this.yearView);
};

CalendarBTD.prototype.clickNextYearMY = function(e, elCell) {
	this.yearView = this.yearView + 10;
	this.loadChooseMY(this.yearView);
};

CalendarBTD.prototype.addEventClickYearMY = function(elCell, type) {
	var self = this;
	if (type == 0) {
		utilObj.addEvent(elCell, "click", function(e) {
			self.clickPreviousYearMY(e, elCell);
		});
	}
	else if (type == 6) {
		utilObj.addEvent(elCell, "click", function(e) {
			self.clickNextYearMY(e, elCell);
		});
	}
	else {
		utilObj.addEvent(elCell, "click", function(e) {
			self.clickYearMY(e, elCell);
		});
	}
};

CalendarBTD.prototype.createYearMY = function(yearView) {
	var elTable = utilObj.createEl("TABLE");
	elTable.border = elTable.cellPadding = elTable.cellSpacing = 0;
	elTable.align = "center";
	elTable.style.padding = "10px";
	elTable.nameCalendar = this.myName;
	var count = yearView - (yearView % 10);
	for (var i = 0; i < 2; i++) {
		var elRow = elTable.insertRow(i);
		for (var j = 0; j < 7; j++) {
			if (j == 0 || j == 6) {
				if (i == 0) {
					var elCell = elRow.insertCell(j);
					elCell.rowSpan = "2";
					var elDiv = utilObj.createEl("DIV");
					elDiv.nameCalendar = this.myName;
					elCell.appendChild(elDiv);
					if (j == 0) {
						elDiv.style.marginRight = "5px";
						elDiv.className = "btnPreviousYearMY";
					}
					else {
						elDiv.style.marginLeft = "5px";
						elDiv.className = "btnNextYearMY";
					}
					this.addEventClickYearMY(elCell, j);
				}
			}
			else {
				if (i == 1) {
					if (j == 0 || j == 6) continue;
				}
				// Year
				var elCell = elRow.insertCell(i == 0 ? j : j - 1);
				elCell.className = "year";
				elCell.nameCalendar = this.myName;
				elCell.innerHTML = elCell.year = count;
				this.addEventClickYearMY(elCell, j);
				if (this.yearSelected == elCell.year) {
					elCell.className = "yearSelected";
					this.elYearSelected = elCell;
				}
				count++;
			}
		}
	}
	return elTable;
};

CalendarBTD.prototype.clickBtnChooseMY = function(e) {
	var mm = this.elMonthSelected.month;
	var yy = this.elYearSelected.year;
	this.dateView = new Date(mm + "/01/" + yy);
	this.loadCalendar(this.dateView);
	this.hideChooseMY(e);
};

CalendarBTD.prototype.createBtnMY = function() {
	var elTable = utilObj.createEl("TABLE");
	elTable.border = elTable.cellPadding = elTable.cellSpacing = 0;
	elTable.align = "center";
	elTable.nameCalendar = this.myName;
	var self = this;
	// Button Choose
	var elRow = elTable.insertRow(0);
	var elCell = elRow.insertCell(0);
	elCell.style.padding = "0 5px";
	var elBtn = utilObj.createEl("A");
	elBtn.href = "javascript:void(0)";
	elBtn.className = "btn";
	elBtn.nameCalendar = this.myName;
	elBtn.innerHTML = "Chọn";
	utilObj.addEvent(elBtn, "click", function(e) {
		self.clickBtnChooseMY(e);
	});
	this.elContainerMY.elFocus = elBtn;
	elCell.appendChild(elBtn);
	// Button Cancel
	elCell = elRow.insertCell(1);
	elCell.style.padding = "0 5px";
	elBtn = utilObj.createEl("DIV");
	elBtn.className = "btn";
	elBtn.nameCalendar = this.myName;
	elBtn.innerHTML = "Hủy";
	utilObj.addEvent(elBtn, "click", function(e) {
		self.hideChooseMY(e);
	});
	elCell.appendChild(elBtn);
	return elTable;
};

CalendarBTD.prototype.createContainerTable = function() {
	var elTable = utilObj.createEl("TABLE");
	elTable.className = "tableContainer";
	elTable.nameCalendar = this.myName;
	this.elContainerList.appendChild(elTable);

	// Row header
	var elRow = elTable.insertRow(0);
	var elCell = elRow.insertCell(0);
	elCell.className = "cell cellHeader";
	elCell.nameCalendar = this.myName;
	elCell.appendChild(this.createHeader());

	// Row body
	elRow = elTable.insertRow(1);
	elCell = elRow.insertCell(0);
	elCell.className = "cell";
	elCell.nameCalendar = this.myName;
	this.elContainerCalendar = elCell;

	// Row footer
	elRow = elTable.insertRow(2);
	elCell = elRow.insertCell(0);
	elCell.className = "cell";
	elCell.nameCalendar = this.myName;
	elCell.appendChild(this.createFooter());

};

CalendarBTD.prototype.getDataView = function(isPressButton) {
	if (isPressButton) {
		return this.dateView != null ? this.dateView : this.dateNow;
	}
	var dateV = this.dateNow;
	if (this.oTextBox.value.trim() != "") {
		dateV = this.dateSelected = Date.parseDateVN(this.oTextBox.value);
		this.dateView = new Date((dateV.getMonth() + 1) + "/01/" + dateV.getFullYear());
	}
	else if (this.dateView != null) {
		dateV = this.dateView;
	}
	return dateV;
};

CalendarBTD.prototype.clickPreviousYear = function(e) {
	var dateV = this.getDataView(true);
	var mm = dateV.getMonth() + 1;
	var yy = dateV.getFullYear() - 1;
	this.dateView = new Date(mm + "/01/" + yy);
	this.loadCalendar(this.dateView);
};

CalendarBTD.prototype.clickNextYear = function(e) {
	var dateV = this.getDataView(true);
	var mm = dateV.getMonth() + 1;
	var yy = dateV.getFullYear() + 1;
	this.dateView = new Date(mm + "/01/" + yy);
	this.loadCalendar(this.dateView);
};

CalendarBTD.prototype.clickPreviousMonth = function(e) {
	var dateV = this.getDataView(true);
	var mm = (dateV.getMonth() == 0 ? 11 : dateV.getMonth() - 1) + 1;
	var yy = dateV.getMonth() == 0 ? dateV.getFullYear() - 1 : dateV.getFullYear();
	this.dateView = new Date(mm + "/01/" + yy);
	this.loadCalendar(this.dateView);
};

CalendarBTD.prototype.clickNextMonth = function(e) {
	var dateV = this.getDataView(true);
	var mm = (dateV.getMonth() == 11 ? 0 : dateV.getMonth() + 1) + 1;
	var yy = dateV.getMonth() == 11 ? dateV.getFullYear() + 1 : dateV.getFullYear();
	this.dateView = new Date(mm + "/01/" + yy);
	this.loadCalendar(this.dateView);
};

CalendarBTD.prototype.createHeader = function() {
	var elTable = utilObj.createEl("TABLE");
	elTable.className = "header";
	elTable.border = elTable.cellPadding = elTable.cellSpacing = 0;
	elTable.width = "100%";
	elTable.nameCalendar = this.myName;
	var elRow = elTable.insertRow(0);
	var self = this;
	// Previous button year
	var elCell = elRow.insertCell(0);
	elCell.nameCalendar = this.myName;
	var elDiv = utilObj.createEl("DIV");
	elDiv.className = "btnPreviousYear";
	elDiv.nameCalendar = this.myName;
	elCell.appendChild(elDiv);
	utilObj.addEvent(elDiv, "click", function(e) {
		self.clickPreviousYear(e);
	});
	// Previous button month
	elCell = elRow.insertCell(1);
	elCell.nameCalendar = this.myName;
	elDiv = utilObj.createEl("DIV");
	elDiv.className = "btnPreviousMonth";
	elDiv.nameCalendar = this.myName;
	elCell.appendChild(elDiv);
	utilObj.addEvent(elDiv, "click", function(e) {
		self.clickPreviousMonth(e);
	});

	// Show month and year
	elCell = elRow.insertCell(2);
	elCell.className = "showMonthAndYear";
	elCell.nameCalendar = this.myName;
	this.elContainerTextDate = elCell;
	elCell.width = "100%";
	utilObj.addEvent(elCell, "click", function(e) {
		self.showChooseMY(e);
	});

	// Next button month
	elCell = elRow.insertCell(3);
	elCell.nameCalendar = this.myName;
	elDiv = utilObj.createEl("DIV");
	elDiv.className = "btnNextMonth";
	elDiv.nameCalendar = this.myName;
	elCell.appendChild(elDiv);
	utilObj.addEvent(elDiv, "click", function(e) {
		self.clickNextMonth(e);
	});
	// Next button year
	elCell = elRow.insertCell(4);
	elCell.nameCalendar = this.myName;
	elDiv = utilObj.createEl("DIV");
	elDiv.className = "btnNextYear";
	elDiv.nameCalendar = this.myName;
	elCell.appendChild(elDiv);
	utilObj.addEvent(elDiv, "click", function(e) {
		self.clickNextYear(e);
	});
	return elTable;
};

CalendarBTD.prototype.loadCalendar = function(dataV) {
	this.elContainerCalendar.innerHTML = "";
	dateV = dataV == null ? this.getDataView(false) : dataV;
	this.elContainerTextDate.innerHTML = MonthBTD[dateV.getMonth()] + " " + dateV.getFullYear();
	this.elContainerCalendar.appendChild(this.createBody(dateV));
};

CalendarBTD.prototype.selectDateByCell = function(elCell) {
	if (this.elCellDateSelected != null) {
		var arrTemp = this.elCellDateSelected.className.split(" ");
		this.elCellDateSelected.className =
			arrTemp.length == 3 ? arrTemp[0] + " " + arrTemp[1] : arrTemp[0];
	}
	elCell.className += " dateSelected";
	this.elCellDateSelected = elCell;
};

CalendarBTD.prototype.selectDate = function (e) {
	var elCell = this.elCellDateSelected;

	this.dateSelected = new Date(elCell.solarDate[1] + "/" + elCell.solarDate[0] + "/" + elCell.solarDate[2]);
	this.oTextBox.value = this.dateSelected.toVNString(Date.stringFormat.date);
	this.hideList(e);
	this.createEventChange(e);
};

CalendarBTD.prototype.clickSelectDate = function(e, elCell) {
	this.selectDateByCell(elCell);
	this.selectDate(e);
};

CalendarBTD.prototype.addEventClickForCellDate = function(elCell) {
	var self = this;
	utilObj.addEvent(elCell, "click", function(e) {
		self.clickSelectDate(e, elCell);
	});
};

CalendarBTD.prototype.createBody = function(dateView) {
	// Reset elCellDateSelected
	this.elCellDateSelected = null;
	var elTable = utilObj.createEl("TABLE");
	elTable.className = "body";
	elTable.border = elTable.cellPadding = elTable.cellSpacing = 0;
	elTable.nameCalendar = this.myName;
	var elRow = elTable.insertRow(0);
	for (var j = 0; j < DayOfWeekBTD.length; j++) {
		// Day Of Week
		var elCell = elRow.insertCell(j);
		elCell.className = "dayOfWeek";
		elCell.nameCalendar = this.myName;
		elCell.innerHTML = DayOfWeekBTD[j];
	}
	var monthView = dateView.getMonth() + 1;
	var yearView = dateView.getFullYear();
	var monthPre = monthView == 1 ? 12 : monthView - 1;
	var yearPre = monthView == 1 ? yearView - 1 : yearView;
	var monthNext = monthView == 12 ? 1 : monthView + 1;
	var yearNext = monthView == 12 ? yearView + 1 : yearView;

	var dayOfMonthPre = Date.maxDateInMonth(monthPre, yearPre);
	var dayOfMonth = Date.maxDateInMonth(monthView, yearView);
	var dateTemp = new Date(monthView + "/01/" + yearView);

	var count = 0;
	var countDayOfMonthNext = 0;
	var startCount = false;
	var lunarMonth = 0;

	for (var i = 1; i <= 6; i++) {
		elRow = elTable.insertRow(i);
		for (var j = 0; j < DayOfWeekBTD.length; j++) {
			var elCell = elRow.insertCell(j);
			elCell.nameCalendar = this.myName;

			if (!startCount) {
				if (j >= dateTemp.getDay()) {
					startCount = true;
				}
			}
			if (startCount) {
				count++;
			}
			if (count == 0) {
				elCell.className = "dayNotInMonth";
				var dd = dayOfMonthPre - dateTemp.getDay() + j + 1;
				var mm = monthPre;
				var yyyy = yearPre;
			}
			else if (count > dayOfMonth) {
				countDayOfMonthNext++;
				elCell.className = "dayNotInMonth";
				var dd = countDayOfMonthNext;
				var mm = monthNext;
				var yyyy = yearNext;
			}
			else {
				elCell.className = j == 0 || j == DayOfWeekBTD.length - 1 ? "weekend" : "dayInWeek";
				var dd = count;
				var mm = monthView;
				var yyyy = yearView;
			}
			// Check Date Now
			if (this.dateNow.getDate() == dd &&
				this.dateNow.getMonth() + 1 == mm &&
				this.dateNow.getFullYear() == yyyy) {
				elCell.className += " dateNow";
			}
			// Check Date Selected
			if (this.dateSelected != null &&
					this.dateSelected.getDate() == dd &&
					this.dateSelected.getMonth() + 1 == mm &&
					this.dateSelected.getFullYear() == yyyy) {
				elCell.className += " dateSelected";
				this.elCellDateSelected = elCell;
			}
			if (this.isShowLunarCalendar) {
				elCell.style.width = "25px";
				var elSolar = utilObj.createEl("DIV");
				elSolar.className = "solar";
				elSolar.nameCalendar = this.myName;
				elCell.appendChild(elSolar);
				var elLunar = utilObj.createEl("DIV");
				elLunar.className = "lunar";
				elLunar.nameCalendar = this.myName;
				elCell.appendChild(elLunar);

				elSolar.innerHTML = dd;
				var lunarDate = LunarCalendar.convertSolar2Lunar(dd, mm, yyyy, 7);
				if (lunarMonth == lunarDate[1]) {
					elLunar.innerHTML = lunarDate[0];
				}
				else {
					lunarMonth = lunarDate[1];
					elLunar.innerHTML = lunarDate[0] + '/' + lunarDate[1];
				}
				elCell.solarDate = new Array(dd, mm, yyyy);
				elCell.lunarDate = lunarDate;
			}
			else {
				elCell.innerHTML = dd;
				elCell.solarDate = new Array(dd, mm, yyyy);
			}

			this.addEventClickForCellDate(elCell);
		}
	}
	return elTable;
};

CalendarBTD.prototype.clickToday = function(e) {
	this.oTextBox.value = this.dateNow.toVNString(Date.stringFormat.date);
	this.dateSelected = Date.parseDateVN(this.oTextBox.value);
	this.hideList();
	this.createEventChange(e);
};

CalendarBTD.prototype.createFooter = function() {
	var elDIV = utilObj.createEl("DIV");
	elDIV.className = "footer";
	elDIV.nameCalendar = this.myName;
	var self = this;

	// Button today
	var elBtn = utilObj.createEl("A");
	elBtn.href = "javascript:void(0)";
	elBtn.className = "btnToday";
	elBtn.nameCalendar = this.myName;
	elBtn.innerHTML = "Hôm nay";
	utilObj.addEvent(elBtn, "click", function(e) {
		self.clickToday(e);
	});
	elDIV.appendChild(elBtn);
	this.elContainerList.elFocus = elBtn;
	return elDIV;
};

/*****************************************************************************
Create element in DropDownList End
*****************************************************************************/

/*****************************************************************************
Create action when execute event Start
*****************************************************************************/

/*===================================Document Event=======================================*/
CalendarBTD.prototype.documentMouseDown = function(e) {
	var el = utilObj.getTargetElement();
	if (typeof (el.nameCalendar) != "undefined" && el.nameCalendar == this.myName) {
		while (el != null) {
			if (el.className == "listDayCalendar") {
				this.elContainerList.elFocus.focus();
				utilObj.stopEvent();
				break;
			}
			else if (el.className == "listDayCalendar chooseMY") {
				this.elContainerMY.elFocus.focus();
				utilObj.stopEvent();
				break;
			}
			el = el.parentNode;
		}
		return;
	}
	this.hideList(e);
};
/*===================================Document Event=======================================*/

/*****************************************************************************
Create action when execute event End
*****************************************************************************/

/*****************************************************************************
Event Start
*****************************************************************************/

CalendarBTD.prototype.addEvent = function(eventName, func) {
	if (this.listEvent[eventName] == null) {
		this.listEvent[eventName] = [];
	}
	this.listEvent[eventName].push(func);
};

CalendarBTD.prototype.removeEvent = function(eventName, func) {
	if (this.listEvent[eventName] == null) {
		return;
	}
	for (var i = 0; i < this.listEvent[eventName].length; i++) {
		if (func == this.listEvent[eventName][i]) {
			this.listEvent[eventName].splice(i, 1);
			break;
		}
	}
};

CalendarBTD.prototype.executeEvent = function(e, eventName) {
	if (this.listEvent[eventName] != null) {
		for (var i = 0; i < this.listEvent[eventName].length; i++) {
			this.listEvent[eventName][i](e);
		}
	}
};

/*****************************************************************************
Event End
*****************************************************************************/

/*****************************************************************************
Private Method Start
*****************************************************************************/

CalendarBTD.prototype.calcPosition = function() {
	var sizeParent = utilObj.getElementSize(this.elContainer);
	var sizeChild = utilObj.getElementSize(this.elContainerList);
	var docScroll = utilObj.getDocumentScroll();
	var pos = utilObj.getElementPositionView(this.elContainer);
	var sizeClient = utilObj.getDocument();
	if ((pos.Y + sizeParent.height + sizeChild.height - docScroll.scrollTop) > sizeClient.clientHeight) {
		pos.Y -= sizeChild.height + 2;
	}
	else {
		pos.Y += sizeParent.height - 1;
	}
	if (sizeChild.width > sizeClient.clientWidth) {
		pos.X = docScroll.scrollLeft;
	}
	else if (pos.X + sizeChild.width > sizeClient.clientWidth + docScroll.scrollLeft) {
		pos.X = sizeClient.clientWidth + docScroll.scrollLeft - sizeChild.width;
	}
	this.elContainerList.style.top = pos.Y + "px";
	this.elContainerList.style.left = pos.X + "px";
};

CalendarBTD.prototype.showList = function(e) {
	if (this.isShowing) return;
	if (this.oTextBox.disabled) return;
	this.isShowing = true;
	this.loadCalendar();
	this.elContainerList.style.display = "";

	this.calcPosition();
	this.elContainerList.elFocus.focus();
};

CalendarBTD.prototype.hideList = function(e) {
	if (this.elContainerList == null) return;
	this.elContainerList.style.display = "none";
	this.elContainerList.style.top = "-1000px";
	this.elContainerList.style.left = "-1000px";
	this.isShowing = false;
	if (this.isShowingMY) {
		this.hideChooseMY(e);
	}
};

CalendarBTD.prototype.showChooseMY = function(e) {
	if (this.isShowingMY) return;
	this.isShowingMY = true;
	if (this.elContainerMY == null) {
		this.createContainerMY();
	}
	this.loadChooseMY();
	var elParent = utilObj.getElement(e);
	var posParent = utilObj.getElementPosition(elParent);

	this.elContainerMY.style.display = "";
	this.elContainerMY.style.top = (posParent.Y + 10) + "px";
	this.elContainerMY.style.left = (posParent.X + 50) + "px";

	this.elContainerMY.elFocus.focus();
};

CalendarBTD.prototype.hideChooseMY = function(e) {
	if (this.elContainerMY == null) return;
	this.elContainerMY.style.display = "none";
	this.elContainerMY.style.top = "-1000px";
	this.elContainerMY.style.left = "-1000px";
	this.isShowingMY = false;
};

/*****************************************************************************
Private Method End
*****************************************************************************/

CalendarBTD.prototype.createEventChange = function(e) {
	if (this.oldValue != this.oTextBox.value) {
		this.oldValue = this.oTextBox.value;
		this.executeEvent(e, EventNameCalendar.change);
	}
};

CalendarBTD.prototype.mouseOver = function(e) {
	this.oBtn.className = "btn_over";
};

CalendarBTD.prototype.mouseOut = function(e) {
	this.oBtn.className = "btn";
};

CalendarBTD.prototype.mouseClick = function(e) {
	this.showList(e);
	this.executeEvent(e, EventNameCalendar.click);
};

CalendarBTD.prototype.changeTextBox = function(e) {
	this.oTextBox.value = this.oTextBox.value.trim();
	if (this.oTextBox.value == "") {
		this.dateSelected = null;
		this.createEventChange(e);
		return;
	}
	if (!Date.checkStringVN(this.oTextBox.value)) {
		this.oTextBox.value = this.oldValue;
	}
	else {
		this.dateSelected = Date.parseDateVN(this.oTextBox.value);
		this.oTextBox.value = this.dateSelected.toVNString(Date.stringFormat.date);
		this.createEventChange(e);
	}
};

/*****************************************************************************
Public Method Start
*****************************************************************************/
CalendarBTD.prototype.setDate = function (oDate) {
	if (oDate == null || oDate == '') return;
	if (typeof oDate == "string") {
		if (Date.checkStringVN(oDate)) {
			this.oTextBox.value = this.oldValue = oDate;
			this.dateSelected = Date.parseDateVN(this.oTextBox.value);
		}
		else {
			this.dateSelected = Date.parseDate(oDate, Date.stringFormat.dateTime);
			this.oTextBox.value = this.oldValue = this.dateSelected.toVNString(Date.stringFormat.date);
		}
		this.oTextBox.value = this.dateSelected.toVNString(Date.stringFormat.date);
	}
	else {
		this.oTextBox.value = this.oldValue = oDate.toVNString(Date.stringFormat.date);
		this.dateSelected = Date.parseDateVN(this.oTextBox.value);
	}
};

CalendarBTD.prototype.reset = function() {
	this.oTextBox.value = this.oldValue = "";
	this.dateView = null;
	this.dateSelected = null;
};

CalendarBTD.prototype.getDate = function() {
	return this.dateSelected;
};

CalendarBTD.prototype.getStringDate = function() {
	return this.oTextBox.value;
};

CalendarBTD.prototype.focus = function(e) {
	this.showList(e);
};

CalendarBTD.prototype.setWidth = function(w) {
	w += "";
	w = (w.indexOf("%", 0) == -1) ? ((w.indexOf("px", 0) == -1) ? w + "px" : w) : w;
	this.elContainer.style.width = w;
};

CalendarBTD.prototype.getPositionView = function() {
	return utilObj.getElementPositionView(this.elContainer);
};

CalendarBTD.prototype.getSize = function() {
	return utilObj.getElementSize(this.elContainer);
};

CalendarBTD.prototype.disable = function() {
	this.oTextBox.disabled = true;
};

CalendarBTD.prototype.enable = function() {
	this.oTextBox.disabled = false;
};

CalendarBTD.prototype.getStatus = function () {
	return this.oTextBox.disabled;
};


/*****************************************************************************
Public Method End
*****************************************************************************/
