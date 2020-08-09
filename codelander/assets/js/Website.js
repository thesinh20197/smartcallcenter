/// <reference path="../ToolsJS/GridView/GridViewBTD.js" />
/// <reference path="../ToolsJS/Util.js" />

function crossDomainAjax(url, paras, successCallback) {

	function createParaPost(paras) {
		var result = "";
		for (var key in paras) {
			if (typeof (paras[key]) == "object") continue;
			if (result != "") result += "&";
			result += key + "=" + encodeURIComponent(paras[key]);
		}
		return result;
	};

	// IE8 & 9 only Cross domain JSON GET request
	if ('XDomainRequest' in window && window.XDomainRequest !== null) {
		var xdr = new XDomainRequest(); // Use Microsoft XDR
		xdr.open('GET', url + "?" + createParaPost(paras));
		xdr.onload = function () {
			var dom = new ActiveXObject('Microsoft.XMLDOM'),
				JSON = $.parseJSON(xdr.responseText);

			dom.async = false;

			if (JSON == null || typeof (JSON) == 'undefined') {
				JSON = $.parseJSON(data.firstChild.textContent);
			}

			successCallback(JSON); // internal function
		};

		xdr.onerror = function () {
			_result = false;
		};

		xdr.send();
	}

	// IE7 and lower can't do cross domain
	// I'm using jQuery's $.browser (deprecated in 1.9 of course)
	// You could change this to navigator.userAgent, whatever works for you of course

	else if ($.browser.msie && parseInt($.browser.version, 10) <= 7) {
		return false;
	}

	// Do normal jQuery AJAX for everything else          
	else {
		$.ajax({
			url: url,
			data: paras,
			cache: false,
			dataType: 'json',
			type: 'POST',
			async: false, // must be set to false
			success: function (data, success) {
				successCallback(data);
			}
		});
	}
};

var ToolTip = {
	elTip: null,
	elContainerTip: null,
	elContainCanvas: null,
	oldData: null,
	createElArrow: function () {
		var canvas = document.createElement('canvas');
		canvas.width = 28;
		canvas.height = 58;
		canvas.style.position = 'absolute';
		canvas.style.top = '25px';
		canvas.style.left = '205px';
		this.elContainCanvas.appendChild(canvas);
		var dc = canvas.getContext("2d");
		dc.clearRect(0, 0, canvas.width, canvas.height);

		// arrowhead
		dc.fillStyle = "#222";
		dc.beginPath();
		dc.moveTo(0, 0);
		dc.lineTo(0, 50);
		dc.lineTo(25, 25);
		dc.closePath();
		dc.fill();

		// line
		dc.lineWidth = 1;
		dc.fillStyle = dc.strokeStyle = '#aaa';
		dc.lineCap = 'round';
		dc.beginPath();
		dc.moveTo(0, 0);
		dc.lineTo(25, 25);
		dc.lineTo(0, 50);
		dc.stroke();
	},

	createElTip: function () {
		if (this.elContainerTip == null) {
			this.elContainerTip = utilObj.createEl("DIV");
			this.elContainerTip.className = "tipCss";
			this.elContainerTip.style.display = "block";
			this.elContainerTip.style.position = "absolute";
			utilObj.addChildToBody(this.elContainerTip);
			this.elContainCanvas = document.createElement("DIV");
			this.elContainCanvas.style.position = 'relative';
			this.elContainerTip.appendChild(this.elContainCanvas);
			this.elTip = document.createElement("DIV");
			this.elContainCanvas.appendChild(this.elTip);
			try {
				this.createElArrow();
			} catch (e) { }
		}

	},

	displayData: function (data) {
		this.createElTip();
		this.elTip.innerHTML = data;
	},

	show: function (e, el, funcData, css) {
		this.createElTip();
		if (funcData != null) {
			if (funcData instanceof Function) {
				this.elTip.innerHTML = funcData();
			}
			else if (typeof funcData == "string") {
				if (this.oldData != funcData) {
					this.elTip.innerHTML = funcData;
				}
			}
			else {
				this.elTip.innerHTML = "";
				funcData.style.display = "";
				this.elTip.appendChild(funcData);
			}
			this.oldData = funcData;
		}
		if (this.elTip.innerHTML.trim() != "") {
			var posParent = utilObj.getElementPositionView(el);
			this.elContainerTip.className = css != null ? css : "tipCss";
			this.elContainerTip.style.display = "block";
			this.elContainerTip.style.top = posParent.Y + "px";
			this.elContainerTip.style.left = (posParent.X - 240) + "px";
		}
	},

	hide: function () {
		this.createElTip();
		this.elContainerTip.style.display = "none";
		this.elContainerTip.style.top = "-1000px";
		this.elContainerTip.style.left = "-1000px";
	},

	register: function (el, funcData, css) {
		var self = this;
		utilObj.addEvent(el, "mousemove", function (e) {
			self.show(e, el, funcData, css);
		});
		utilObj.addEvent(el, "mouseout", function (e) {
			self.hide();
		});
	}
};

var dataInit = null;

var GasHuongDuong =
{
	userLogin: null,
	isMobile: false,
	action: new MainHandler(),
	listFunctionInt: [],
	init: function () {
		for (var i = 0; i < this.listFunctionInt.length; i++) {
			this.listFunctionInt[i]();
		}
	},
	addFunctionInt: function (f) {
		this.listFunctionInt.push(f);
	},

	getData: function (response) {
		if (response.error != null) {
			alert(response.error.message);
			return null;
		}
		var result = response.result;
		if (result.hasErrors) {
			alert(result.errorsAlert);
			return null;
		}
		return result.data;
	},
	getDataSyn: function (result) {
		if (result.hasErrors) {
			alert(result.errorsAlert);
			return null;
		}
		return result.data;
	}
};

GasHuongDuong.showTip = function (elA, infoID) {
	if (elA.isReg == null) {
		ToolTip.register(elA, document.getElementById(infoID).innerHTML);
		elA.isReg = true;
	}
};

GasHuongDuong.ajax = {
	blockID: 0,
	href: "",
	idContainer: "",
	showLoader: function () {
		var elContainer = document.getElementById(this.idContainer);
		if (elContainer != null) {
			var size = utilObj.getElementSize(elContainer);
			elContainer.innerHTML = "<div style='display:table-cell; vertical-align:middle; text-align:center; height:" + size.height + "px; width:" + size.width + "px;'><img src='/Images/AjaxLoader.gif' border='0' /></div>";
		}
	},
	getData: function (responseText) {
		var elContainer = document.getElementById(this.idContainer);
		if (elContainer != null) {
			// location.href = this.href + "#targetPaging" + this.blockID;
			elContainer.innerHTML = responseText;
		}
	},
	gotoPage: function (elA, idContainer, blockID) {
		this.idContainer = idContainer;
		this.blockID = blockID;
		this.showLoader();
		if (elA.content == null) {
			var action = new AjaxBTD(function (responseText) { elA.content = responseText; GasHuongDuong.ajax.getData(responseText); });
			action.processGET(elA.href);
		}
		else {
			GasHuongDuong.ajax.getData(elA.content);
		}
	}
};

var Product = {
	elTimeDiscount: null,
	totalSecond: 0,
	currentBtn: null,
	currentProduct: null,

	countDown: function () {
		var totalSecondDay = 24 * 60 * 60;
		var day = parseInt(this.totalSecond / totalSecondDay, 10);
		var hour = parseInt((this.totalSecond % totalSecondDay) / (60 * 60), 10);
		var minute = parseInt(((this.totalSecond % totalSecondDay) % (60 * 60)) / 60, 10);
		var second = parseInt(((this.totalSecond % totalSecondDay) % (60 * 60)) % 60, 10);
		this.elTimeDiscount.innerHTML = day + " ngày " + hour + ":" + minute + ":" + second;
		this.totalSecond--;
		if (this.totalSecond > 0) {
			var me = this;
			setTimeout(function () {
				me.countDown();
			}, 1000);
		}
	},
	init: function () {
		this.currentBtn = document.getElementById('btnBasic');
		this.currentProduct = document.getElementById('productBasic');
	},
	selected: function (idBtn, idProduct) {
		if (this.currentBtn != null) {
			this.currentBtn.className = "";
			this.currentProduct.className = "product";
		}
		this.currentBtn = document.getElementById(idBtn);
		this.currentProduct = document.getElementById(idProduct);
		this.currentBtn.className = "selected";
		this.currentProduct.className = "product selected";
	}
};

var TestAutoCall = {
	elBtnTestAutoCall: null,
	count: 0,

	testAutoCall: function () {
		var o = {};
		var elHoTen = document.getElementById('tbxHoTen');
		o.hoTen = elHoTen.value.trim();
		if (o.hoTen == '') {
			alert('Mời bạn nhập họ tên.');
			elHoTen.focus();
			return;
		}
		var elSoDienThoai = document.getElementById('tbxSoDienThoai');
		o.soDienThoai = elSoDienThoai.value.trim();
		if (o.soDienThoai == '') {
			alert('Mời bạn nhập số điện thoại.');
			elSoDienThoai.focus();
			return;
		}
		var elMaBaoMat = document.getElementById('tbxMaBaoMat');
		o.maBaoMat = elMaBaoMat.value.trim();
		if (o.maBaoMat == '') {
			alert('Mời bạn nhập mã bảo mật.');
			elMaBaoMat.focus();
			return;
		}

		var me = this;
		LoaderAjax.show();
		GasHuongDuong.action.testAutoCall(o, function (response) {
			LoaderAjax.hide();
			var re = GasHuongDuong.getData(response);
			if (re == null) return;
			me.count++;
			elHoTen.value = '';
			elSoDienThoai.value = '';
			elMaBaoMat.value = '';
			document.getElementById('imgTestCallWV').src = '/ImageWordVerification.ashx?key=TestCallWV&h=30&count=' + me.count;
			alert('Đã gửi lệnh thành công.');
		});
	},

	init: function () {
		var me = this;
		this.elBtnTestAutoCall = document.getElementById('btnTestAutoCall');
		utilObj.addEvent(this.elBtnTestAutoCall, EventName.click, function (e) {
			me.testAutoCall();
		});
	}
};

var MenuTreeTop = {
	elBlockBg: null,
	elMenuTreeRoot: null,

	init: function () {
		var me = this;
		this.elBlockBg = document.createElement('DIV');
		$(this.elBlockBg).css({
			position: 'fixed',
			top: 0,
			left: 0,
			height: $(window).height() + 'px',
			width: $(window).width() + 'px',
			opacity: '0.8',
			backgroundColor: '#888888',
			zIndex: 100,
			display: "none"
		});
		document.body.appendChild(this.elBlockBg);
		this.elMenuTreeRoot = document.getElementById('cMenuTreeRoot');
		$(this.elMenuTreeRoot)
			.mouseover(function () {
				var pos = $(me.elMenuTreeRoot).offset();
				$('#menuTree').css({
					display: "block",
					top: pos.top + 38,
					left: pos.left
				});
				$(me.elBlockBg).css({
					height: $(window).height() + 'px',
					width: $(window).width() + 'px',
					display: "block"
				});
			})
			.mouseout(function () {
				$('#menuTree').css({ display: "none" });
				$(me.elBlockBg).css({ display: "none" });
			});
		$('#menuTree')
			.mouseover(function () {
				var pos = $(me.elMenuTreeRoot).offset();
				$('#menuTree').css({
					display: "block",
					top: pos.top + 38,
					left: pos.left
				});
				$(me.elBlockBg).css({
					height: $(window).height() + 'px',
					width: $(window).width() + 'px',
					display: "block"
				});
			})
			.mouseout(function () {
				$('#menuTree').css({ display: "none" });
				$(me.elBlockBg).css({ display: "none" });
			});
		$('#menuTree li').each(function () {
			var li = $(this);
			li.mouseover(function () {
				var pos = $(me.elMenuTreeRoot).offset();
				li.css({ backgroundColor: '#' + li.data('color') });
				li.find('a').css({ color: '#fff' });
				var child = $('#cMenuChild-' + li.data('catid'));
				child.css({
					display: "block",
					top: pos.top + 38,
					left: pos.left + 215,
					borderLeft: '5px solid #' + li.data('color')
				});
				child.mouseover(function () {
					$('#menuTree').css({
						display: "block",
						top: pos.top + 38,
						left: pos.left
					});
					li.css({ backgroundColor: '#' + li.data('color') });
					li.find('a').css({ color: '#fff' });
					child.css({
						display: "block",
						top: pos.top + 38,
						left: pos.left + 215,
						borderLeft: '5px solid #' + li.data('color')
					});
					$(me.elBlockBg).css({
						height: $(window).height() + 'px',
						width: $(window).width() + 'px',
						display: "block"
					});
				})
					.mouseout(function () {
						$('#menuTree').css({ display: "none" });
						child.css({ display: "none" });
						li.css({ backgroundColor: '#fff' });
						li.find('a').css({ color: '#000' });
						$(me.elBlockBg).css({ display: "none" });
					});
			})
				.mouseout(function () {
					li.css({ backgroundColor: '#fff' });
					li.find('a').css({ color: '#000' });
					var child = $('#cMenuChild-' + li.data('catid'));
					child.css({ display: "none" });
				});
		});
	}
};

var HomeTabCategory = {

	createListProduct: function (cListProduct, list) {
		var html = '<ul>';
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			var s = "";
			if (item.isNew) {
				s += "<span class=\"statusNew\"></span>";
			}
			if (item.isPromo) {
				s += "<span class=\"statusPromo\"></span>";
			}
			if (item.isHot) {
				s += "<span class=\"statusHot\"></span>";
			}

			html += '<li>' + s + '<div class="cImage"><a title="' + item.nameAlt + '" href="' + item.userDefineURL + '"><img alt="' + item.nameAlt + '" src="' + item.imageURL + '"></a></div><div class="cName"><a title="' + item.nameAlt + '" href="' + item.userDefineURL + '">' + item.name + '</a></div><div class="cPrice">' + item.priceText + '</div><div class="clear"></div></li>';
		}
		html += '<div class="clear"></div></ul>';
		cListProduct.html(html);
	},

	init: function () {
		var me = this;
		$(".cCategoryHome").each(function () {
			var cListProduct = $(this).find(".cListProduct");
			$(this).find(".tabCat").each(function () {
				$(this).click(function (e) {
					GasHuongDuong.action.getListProductByCategoryID($(this).data("catid"), function (response) {
						var list = GasHuongDuong.getData(response);
						if (list != null) {
							me.createListProduct(cListProduct, list);
						}
					});
				});
			});
		});
	}
};

var SearchControl = {
	tbxSearch: document.getElementById("tbxSearchTop"),
	init: function () {
		this.tbxSearch = document.getElementById("tbxSearchTop");
	},

	submit: function () {
		if (this.go()) {
			document.getElementById("fSearch").submit();
		}
	},
	go: function () {
		var v = this.tbxSearch.value.trim();
		if (v == "") {
			alert("Mời bạn nhập nội dung tìm kiếm.");
			this.tbxSearch.focus();
			return false;
		}
		return true;
	}
};

var ContactForm = {
	elForm: null,

	getData: function () {
		var o = {};
		o.fullName = document.getElementById('tbxFullName').value.trim();
		if (o.fullName == '') {
			alert('Mời bạn nhập họ tên.');
			document.getElementById('tbxFullName').focus();
			return;
		}
		o.email = document.getElementById('tbxEmail').value.trim();
		if (!utilObj.isEmail(o.email)) {
			alert('Mời bạn nhập email đúng định dạng.');
			document.getElementById('tbxEmail').focus();
			return;
		}
		o.phone = document.getElementById('tbxPhone').value.trim();
		if (o.phone == '') {
			alert('Mời bạn nhập số điện thoại.');
			document.getElementById('tbxPhone').focus();
			return;
		}
		/*
		o.title = document.getElementById('tbxTitle').value.trim();
		if (o.title == '') {
			alert('Mời bạn nhập vấn đề liên hệ.');
			document.getElementById('tbxTitle').focus();
			return;
		}
		*/
		o.title = '';
		o.content = document.getElementById('tbxContent').value.trim();
		if (o.content == '') {
			alert('Mời bạn nhập gói dịch vụ bạn muốn sử dụng');
			document.getElementById('tbxContent').focus();
			return;
		}
		return o;
	},

	reset: function () {
		this.elForm.reset();
	},

	sumbit: function () {
		var o = this.getData();
		if (o == null) return;

		var me = this;
		GasHuongDuong.action.insertContact(o, function (response) {
			var re = GasHuongDuong.getData(response);
			if (re == null) return;
			alert('Bạn đã gửi thành công.');
			me.reset();
		});
	},

	init: function () {
		var me = this;
		this.elForm = document.getElementById('contactForm');
		this.elForm.onsubmit = function () {
			me.sumbit();
			return false;
		};
	}
};

var ManagerMember = {
	isLoginSuccess: false,
	elBtnLogin: document.getElementById("btnLoginTop"),
	elBtnRegister: document.getElementById("btnRegisterTop"),
	elBtnEditInfo: document.getElementById("btnEditInfoTop"),
	elCTextLoginT: document.getElementById('cTextLoginT'),
	elCTextOr: document.getElementById('cTextOr'),
	elContainerMenu: null,

	createMenu: function () {
		var elContainerMenu = document.createElement('DIV');
		elContainerMenu.style.position = 'absolute';
		elContainerMenu.style.display = 'none';
		elContainerMenu.className = 'memberMenu';
		this.elContainerMenu = elContainerMenu;
		document.body.appendChild(elContainerMenu);
		var me = this;
		utilObj.addEvent(elContainerMenu, 'mouseover', function (e) {
			me.showMenu();
		});
		utilObj.addEvent(elContainerMenu, 'mouseout', function (e) {
			me.hideMenu();
		});

		var elMenuHome = document.createElement('A');
		elMenuHome.href = '/Quan-Tri-Thanh-Vien';
		elMenuHome.innerHTML = 'Trang chủ';
		this.elContainerMenu.appendChild(elMenuHome);

		var elMenuEditInfo = document.createElement('A');
		elMenuEditInfo.href = 'javascript:;';
		elMenuEditInfo.innerHTML = 'Thay đổi thông tin';
		utilObj.addEvent(elMenuEditInfo, 'click', function (e) {
			ManagerMember.formEditInfo.show();
		});
		this.elContainerMenu.appendChild(elMenuEditInfo);


		var elMenuLogout = document.createElement('A');
		elMenuLogout.href = 'javascript:;';
		elMenuLogout.innerHTML = 'Thoát';
		utilObj.addEvent(elMenuLogout, 'click', function (e) {
			ManagerMember.formLogin.logout();
		});
		this.elContainerMenu.appendChild(elMenuLogout);
	},

	showMenu: function () {
		var posParent = utilObj.getElementPositionView(this.elBtnEditInfo);
		var sizeParent = utilObj.getElementSize(this.elBtnEditInfo);
		this.elContainerMenu.style.display = '';
		this.elContainerMenu.style.top = (posParent.Y + sizeParent.height - 2) + 'px';
		this.elContainerMenu.style.left = (posParent.X + 1) + 'px';
	},

	hideMenu: function () {
		this.elContainerMenu.style.display = 'none';
	},

	init: function () {
		this.elBtnLogin = document.getElementById("btnLoginTop");
		this.elBtnRegister = document.getElementById("btnRegisterTop");
		this.elBtnEditInfo = document.getElementById("btnEditInfoTop");
		var me = this;
		utilObj.addEvent(this.elBtnEditInfo, 'mouseover', function (e) {
			me.showMenu();
		});
		utilObj.addEvent(this.elBtnEditInfo, 'mouseout', function (e) {
			me.hideMenu();
		});
		this.elCTextLoginT = document.getElementById('cTextLoginT');
		this.elCTextOr = document.getElementById('cTextOr');
		this.createMenu();
	},
	showOrHideMenu: function () {
		if (GasHuongDuong.userLogin != null) {
			this.elBtnLogin.style.display = "none";
			this.elCTextLoginT.innerHTML = "Chào bạn";
			this.elCTextOr.style.display = this.elBtnRegister.style.display = "none";
			this.elBtnEditInfo.style.display = "";
			this.elBtnEditInfo.innerHTML = GasHuongDuong.userLogin.username + ' <small style="color: #539300">▼</small>';
		}
		else {
			this.elCTextLoginT.innerHTML = "";
			this.elCTextOr.style.display = this.elBtnLogin.style.display = "";
			this.elBtnRegister.style.display = "";
			this.elBtnEditInfo.style.display = "none";
		}
	}
};

ManagerMember.orderCondition = {
	configDataStatus: {
		textSeparator: ', ',
		textPlaceholder: 'Trạng thái',
		maxItem: 10,
		mapField: {
			value: 'statusID',
			text: 'name',
			search: ['name'],
			display: [
				{ name: 'name', field: 'name', type: ColummTypeDDL.label }
			]
		},
		data: [{ name: 'Chờ duyệt', statusID: 1 }, { name: 'Đã duyệt và chờ giao hàng', statusID: 2 }, { name: 'Thành công', statusID: 3 }, { name: 'Hủy', statusID: 4 }]
	},
	oStatus: new MultiSelectBoxBTD(),

	tbxTuNgay: new CalendarBTD(),
	tbxDenNgay: new CalendarBTD(),

	init: function (elCon) {
		var elTable = document.createElement("table");
		elTable.className = 'cCondition';
		elCon.appendChild(elTable);
		var elRow = elTable.insertRow(elTable.rows.length);
		elCell = elRow.insertCell(elRow.cells.length);
		this.tbxTuNgay = new CalendarBTD(elCell, 'tuNgay', '', false, 'Bắt đầu');
		this.tbxTuNgay.setWidth(90);
		elCell = elRow.insertCell(elRow.cells.length);
		this.tbxDenNgay = new CalendarBTD(elCell, 'denNgay', '', false, 'Đến ngày');
		this.tbxDenNgay.setWidth(90);
		elCell = elRow.insertCell(elRow.cells.length);
		this.oStatus = new MultiSelectBoxBTD(elCell, this.configDataStatus, 'StatusOrder');
		this.oStatus.setWidth(100);

		elCell = elRow.insertCell(elRow.cells.length);
		var elBtn = document.createElement('Button');
		elBtn.innerHTML = 'Xem';
		elCell.appendChild(elBtn);
		utilObj.addEvent(elBtn, EventName.click, function (e) {
			ManagerMember.order.view();
		});
	},

	getValue: function () {
		var data = new Object();
		data.fromDate = this.tbxTuNgay.getDate();
		data.toDate = this.tbxDenNgay.getDate();
		data.listStatus = this.oStatus.getValue();
		return data;
	}
};

ManagerMember.orderDetail = {

	listData: {
		widthGrid: 750,
		head: [
			{ name: "detailOrderID", caption: "Mã số", field: "detailOrderID", type: ColummType.label, isShow: false, isAllowHide: false, typeUpdate: ColummType.keyUpdate },
			{ name: "name", caption: "Sản phẩm", field: "name", type: ColummType.label, isShow: true, width: 300, widthEdit: 150 },
			{ name: "Price", caption: "Giá", field: "price", type: ColummType.labelNumber, isShow: true, width: 60, widthEdit: 150, typeUpdate: ColummType.number },
			{ name: "Amount", caption: "Số lượng", field: "amount", type: ColummType.labelNumber, isShow: true, width: 60, widthEdit: 150, typeUpdate: ColummType.number },
			{ name: "Money", caption: "Thành tiền", field: "[price] * [amount]", type: ColummType.formula, isShow: true, width: 80, widthEdit: 150, typeUpdate: ColummType.none, isShowTotal: false, isShowTotal: true },
			{ name: "Note", caption: "Ghi chú", field: "note", type: ColummType.label, isShow: true, width: 200, widthEdit: 250, typeUpdate: ColummType.textArea }
		],
		data: []
	},
	gv: new GridViewBTD(),
	popup: new ModalPopup(),
	itemOrder: { orderID: 0 },
	maxView: 10,
	isInit: false,
	init: function () {
		if (this.isInit) return;
		this.isInit = true;
		var elCon = document.createElement('div');
		document.body.appendChild(elCon);
		var me = this;
		this.gv = new GridViewBTD(elCon, this.listData, "grdDetailOrderGV");
		// function GridView
		this.gv.isShowAddNew = false; // Show or Hide LinkButton Add New Record
		this.gv.isShowEdit = false; // Show or Hide LinkButton Edit Record
		this.gv.isShowDelete = false; // Show or Hide LinkButton Delete Record
		this.gv.isShowPaging = true; // Show or Hide Paging
		this.gv.isShowTotal = true; // Show or Hide total of Columm
		this.gv.isAllowResizeColumn = true; // Allow Resize Columm
		this.gv.isAllowMoveColumn = true; // Allow Move Columm
		this.gv.isAllowHideColumn = true; // Allow Hide Columm
		this.gv.isAllowStoreCookie = true; // Allow Store width, position, display Column in Cookie
		this.gv.useUpdateDataSystem = true; // Dùng phần thêm mới của hệ thông
		this.gv.isAllowSelectRow = false;

		this.gv.addEventForFunction(EventName.pagingChange, function (e) {
			var p = me.gv.getCurrentIndexPage();
			e = me.gv.getBeginAndEndRecord();
			me.loadData(e.begin, e.end, function () {
				me.gv.changePageByIndex(p, true);
			});
		});

		this.gv.addEventForFunction(EventName.rowDataBound, function (e) {
			// không có cell:  e.elementCell
			var elRow = e.elementRow; 		// Get current Row
			var item = elRow.item; 			// Get current Item

		});

		this.gv.dataBind();

		this.popup = new ModalPopup(elCon, 'Chi tiết đơn hàng');
		this.popup.setZIndex(10000);
	},

	loadData: function (begin, end, callback) {
		var me = this;
		LoaderAjax.show();
		GasHuongDuong.action.getListDetailOrder({ listOrder: this.itemOrder.orderID }, begin, end, function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getData(response);
			if (data == null) return;
			me.listData.data = data.list;
			me.gv.reloadData();
			me.gv.calcTotal();
			me.gv.setPaging(me.maxView, data.total, 10);
			if (callback != null) {
				callback();
			}
		});
	},

	show: function (item) {
		this.itemOrder = item;
		this.init();
		var me = this;
		this.loadData(0, this.maxView, function () { me.popup.display(); });
	},
	reloadData: function () {
		var me = this;
		this.loadData(0, this.maxView, function () { me.popup.display(); });
	}
};

ManagerMember.order = {
	listData: {
		widthGrid: 750,
		head: [
			{ name: "OrderDate", caption: "Ngày đặt", field: "orderDate", type: ColummType.labelDateTime, isShow: true, width: 130, widthEdit: 150, typeUpdate: ColummType.date },
			{ name: "TotalMoney", caption: "Thành tiền", field: "totalMoney", type: ColummType.labelNumber, isShow: true, width: 80, widthEdit: 150, typeUpdate: ColummType.none },
			{ name: "Status", caption: "Trạng thái", field: "status", type: ColummType.labelSelectBox, isShow: true, width: 160, widthEdit: 150, typeUpdate: ColummType.selectBox, dataDDL: ManagerMember.orderCondition.configDataStatus },
			{ name: "Note", caption: "Ghi chú", field: "note", type: ColummType.label, isShow: true, width: 250, widthEdit: 350, typeUpdate: ColummType.textArea },
			{ name: "CommandDetail", caption: "Chi tiết", field: "orderID", type: ColummType.label, isShow: true, width: 50, widthEdit: 150, typeUpdate: ColummType.none }
		],
		data: []
	},
	gv: new GridViewBTD(),
	popup: new ModalPopup(),
	itemOrder: { orderID: 0 },
	maxView: 10,
	isInit: false,
	init: function () {
		if (this.isInit) return;
		this.isInit = true;
		var elCon = document.createElement('div');
		document.body.appendChild(elCon);
		var elConCondition = document.createElement('div');
		elCon.appendChild(elConCondition);
		ManagerMember.orderCondition.init(elCon);
		var me = this;
		this.gv = new GridViewBTD(elCon, this.listData, "grdDetailOrderGVAll");
		// function GridView
		this.gv.isShowAddNew = false; // Show or Hide LinkButton Add New Record
		this.gv.isShowEdit = false; // Show or Hide LinkButton Edit Record
		this.gv.isShowDelete = false; // Show or Hide LinkButton Delete Record
		this.gv.isShowPaging = true; // Show or Hide Paging
		this.gv.isShowTotal = false; // Show or Hide total of Columm
		this.gv.isAllowResizeColumn = true; // Allow Resize Columm
		this.gv.isAllowMoveColumn = true; // Allow Move Columm
		this.gv.isAllowHideColumn = true; // Allow Hide Columm
		this.gv.isAllowStoreCookie = true; // Allow Store width, position, display Column in Cookie
		this.gv.useUpdateDataSystem = true; // Dùng phần thêm mới của hệ thông
		this.gv.isAllowSelectRow = false;

		this.gv.addEventForFunction(EventName.pagingChange, function (e) {
			var p = me.gv.getCurrentIndexPage();
			e = me.gv.getBeginAndEndRecord();
			me.loadData(e.begin, e.end, function () {
				me.gv.changePageByIndex(p, true);
			});
		});

		this.gv.addEventForFunction(EventName.rowDataBound, function (e) {
			// không có cell:  e.elementCell
			var elRow = e.elementRow; 		// Get current Row
			var item = elRow.item; 			// Get current Item
			var elCell = elRow.cells[me.gv.getColumnIndex("CommandDetail")];
			elCell.innerHTML = '';
			var elCommandDetail = document.createElement('a');
			elCommandDetail.href = 'javascript:;';
			elCommandDetail.innerHTML = 'Chi tiết';
			elCell.appendChild(elCommandDetail);
			utilObj.addEvent(elCommandDetail, EventName.click, function (e) {
				ManagerMember.orderDetail.show(item);
			});

		});

		this.gv.dataBind();

		this.popup = new ModalPopup(elCon, 'Quản lý đơn hàng của bạn của bạn');
	},

	loadData: function (begin, end, callback) {
		var me = this;
		LoaderAjax.show();
		GasHuongDuong.action.getListOrder(ManagerMember.orderCondition.getValue(), begin, end, function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getData(response);
			if (data == null) return;
			me.listData.data = data.list;
			me.gv.reloadData();
			me.gv.setPaging(me.maxView, data.total, 10);
			if (callback != null) {
				callback();
			}
		});
	},

	view: function () {
		var me = this;
		this.loadData(0, this.maxView, function () { me.popup.setCenter(); });
	},

	show: function () {
		this.init();
		var me = this;
		this.loadData(0, this.maxView, function () { me.popup.display(); me.popup.setCenter(); });
	}
};

ManagerMember.formLogin = {
	keyCookie: "sLogin",
	maxLoginFail: 3,
	counterLoginFail: 0,
	elTbxUsername: document.getElementById("tbxUserNameT"),
	elTbxPassword: document.getElementById("tbxPasswordT"),
	elChkSavePassword: document.getElementById("chkSavePasswordT"),
	oPopup: new ModalPopup(),
	funcComplet: function () { },

	show: function () {
		this.oPopup.display();
		this.oPopup.setZIndex(100);
		this.focus();
	},
	hide: function () {
		this.oPopup.hide();
	},
	focus: function () {
		this.elTbxUsername.focus();
	},
	login: function (u, p) {
		var me = this;
		LoaderAjax.show();
		GasHuongDuong.action.login(u, p, function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getData(response);
			if (data == null) {
				me.counterLoginFail++;
				if (me.counterLoginFail > me.maxLoginFail) {

				}
				return;
			}
			GasHuongDuong.userLogin = data;
			if (me.elChkSavePassword.checked) {
				var jData = { u: u, p: p };
				utilObj.setCookie(me.keyCookie, JSON.stringify(jData));
			}
			ManagerMember.showOrHideMenu();
			me.hide();
			me.funcComplet();
		});
	},
	logout: function () {
		var me = this;
		function l(dialogResult) {
			if (dialogResult == DialogResultBTD.Yes) {
				GasHuongDuong.action.logout(function (response) {
					var data = GasHuongDuong.getData(response);
					if (data == null) return true;
					GasHuongDuong.userLogin = null;
					utilObj.setCookie(me.keyCookie, null);
					ManagerMember.showOrHideMenu();
					location.href = "/";
				});
			}
			return true;
		}
		MessageBoxBTD.show("Bạn có muốn thoát không?", "Thông báo", MessageBoxButtonsBTD.YesNo, MessageBoxIconBTD.Question, function (dialogResult) { return l(dialogResult) });

	},
	go: function (isBottom) {
		var me = this;
		this.buildElement(isBottom);
		if (isBottom) {
			this.funcComplet = function () {
				Order.showFormRegister();
			}
		}
		var u = this.elTbxUsername.value.trim();
		var p = this.elTbxPassword.value;
		if (u == "") {
			alert("Bạn chưa nhập điện thoại.", function () { me.elTbxUsername.focus(); });
			return;
		}
		if (p == "") {
			alert("Bạn chưa nhập mật khẩu.", function () { me.elTbxPassword.focus(); });
			return;
		}
		p = Encoder.MD5(p);
		this.login(u, p);
	},

	buildElement: function (isBottom) {
		var pre = isBottom ? "B" : "T";
		this.elTbxUsername = document.getElementById("tbxUserName" + pre);
		this.elTbxPassword = document.getElementById("tbxPassword" + pre);
		this.elChkSavePassword = document.getElementById("chkSavePasswordT");
	},

	init: function (isBottom) {
		var me = this;
		this.buildElement(isBottom);
		this.oPopup = new ModalPopup('cLoginT', 'Đăng nhập');
		ManagerMember.showOrHideMenu();
		utilObj.addEvent(this.elTbxPassword, 'keypress', function (e) {
			if (e.keyCode == 13) {
				me.go();
			}
		});
		if (GasHuongDuong.userLogin != null) return;
		var jData = utilObj.getCookie(this.keyCookie);
		if (jData != null && jData != "") {
			jData = JSON.eval(jData);
			if (jData == null) return;
			this.login(jData.u, jData.p);
		}
	}
};

ManagerMember.forgetPassword = {
	tbxUserNameFP: document.getElementById("tbxUserNameFP"),
	tbxEmailFP: document.getElementById("tbxEmailFP"),
	tbxWordVerificationFP: document.getElementById("tbxWordVerificationFP"),
	oPopup: new ModalPopup(),
	counter: 0,
	funcComplet: function () { },

	show: function () {
		this.oPopup.display();
		this.oPopup.setZIndex(110);
		this.focus();

	},
	hide: function () {
		this.oPopup.hide();
	},
	focus: function () {
		this.tbxUserNameFP.focus();
	},
	forget: function (u, e, w) {
		var me = this;
		LoaderAjax.show();
		GasHuongDuong.action.forgetPassword(u, e, w, function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getData(response);
			if (data == null) {
				me.counter++;
				document.getElementById('forgetPassWV').src = "/ImageWordVerification.ashx?key=ForgetPassword&h=20&w=54&l=4&counter=" + me.counter;
				return;
			}
			alert("Mật khẩu mới của bạn đã được gửi vào email của bạn.");
			me.hide();
			me.funcComplet();
		});
	},
	go: function () {
		var me = this;
		var u = this.tbxUserNameFP.value.trim();
		var e = this.tbxEmailFP.value;
		if (u == "") {
			alert("Bạn chưa nhập kí danh.", function () { me.tbxUserNameFP.focus(); });
			return;
		}
		if (e == "") {
			alert("Bạn chưa nhập mật khẩu.", function () { me.tbxEmailFP.focus(); });
			return;
		}
		var w = this.tbxWordVerificationFP.value;
		if (w == "") {
			alert("Bạn chưa nhập mã xác nhận.", function () { me.tbxWordVerificationFP.focus(); });
			return;
		}
		this.forget(u, e, w);
	},
	init: function () {
		var me = this;
		this.oPopup = new ModalPopup('cForgetPasswordT', 'Quên mật khẩu');
		this.tbxUserNameFP = document.getElementById("tbxUserNameFP");
		this.tbxEmailFP = document.getElementById("tbxEmailFP");
		this.tbxWordVerificationFP = document.getElementById("tbxWordVerificationFP");
		ManagerMember.showOrHideMenu();
		utilObj.addEvent(this.tbxWordVerificationFP, 'keypress', function (e) {
			if (e.keyCode == 13) {
				me.go();
			}
		});
	}
};

ManagerMember.formRegister = {
	isExist: false,
	oPopup: new ModalPopup(),
	funcComplet: function () { },
	listCity: [],
	listDistrict: [],
	counterImgT: 0,

	configDataCity: {
		textSeparator: ", ",
		maxItem: 10,
		mapField:
		{
			value: "cityID",
			text: "name",
			search: "name",
			display: [
				{ field: "name", type: ColummTypeDDL.label }
			]
		},
		data: []
	},
	configDataDistrict: {
		textSeparator: ", ",
		maxItem: 10,
		mapField:
		{
			value: "districtID",
			text: "name",
			search: "name",
			display: [
				{ field: "name", type: ColummTypeDDL.label }
			]
		},
		data: []
	},

	elCityT: new DropDownListBTD(),
	elDistrictT: new DropDownListBTD(),
	elCityB: new DropDownListBTD(),
	elDistrictB: new DropDownListBTD(),
	counter: 0,
	checkUsername: function (el, isBottom) {
		var pre = isBottom ? 'B' : 'T';
		var me = this;
		var elAlert = document.getElementById("alertUsername" + pre);
		GasHuongDuong.action.checkUsernameExist(el.value, function (re) {
			var data = GasHuongDuong.getData(re);
			if (data == null) return;
			if (data) {
				elAlert.style.color = "Red";
				elAlert.innerHTML = "<b>" + el.value + "</b> đã tồn tại.";
			}
			else {
				elAlert.style.color = "Green";
				elAlert.innerHTML = "<b>" + el.value + "</b> hợp lệ.";
			}
			me.isExist = data;
		});
	},
	show: function () {
		this.oPopup.display();
		this.focus();
	},
	hide: function () {
		this.oPopup.hide();
	},
	focus: function () {
		document.getElementById("tbxRegUserNameT").focus();
	},
	go: function (isBottom) {
		var pre = isBottom ? 'B' : 'T';
		if (isBottom) {
			this.funcComplet = function () {
				Order.showFormRegister();
			}
		}
		var me = this;
		var u = document.getElementById("tbxRegUserName" + pre).value.trim();
		var p = document.getElementById("tbxRegPassword" + pre).value;
		var reP = document.getElementById("tbxRegRePassword" + pre).value;
		var e = document.getElementById("tbxRegEmail" + pre).value;
		var reE = document.getElementById("tbxRegReEmail" + pre).value;
		var wv = document.getElementById("tbxWordVerification" + pre).value;
		if (u == "") {
			alert("Bạn chưa nhập số điện thoại.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegUserName" + pre).focus();
			});
			return;
		}
		if (this.isExist) {
			alert("Kí danh đã trùng với người khác.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegUserName" + pre).focus();
			});
			return;
		}
		if (p == "") {
			alert("Bạn chưa nhập mật khẩu.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegPassword" + pre).focus();
			});
			return;
		}
		if (p.length < 6) {
			alert("Mật khẩu phải > 6 ký tự.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegPassword" + pre).focus();
			});
			return;
		}
		if (p != reP) {
			alert("Bạn phải lại nhập mật khẩu trùng với mật khẩu đầu.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegRePassword" + pre).focus();
			});
			return;
		}
		p = Encoder.MD5(p);
		if (!utilObj.isEmail(e)) {
			alert("Bạn chưa nhập email đúng định dạng.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegEmail" + pre).focus();
			});
			return;
		}
		if (e != reE) {
			alert("Bạn phải lại nhập email trùng với email đầu.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegReEmail" + pre).focus();
			});
			return;
		}

		var user = { username: u, password: p, email: e };
		user.firstName = document.getElementById("tbxRegFirstName" + pre).value.trim();
		user.lastName = document.getElementById("tbxRegLastName" + pre).value.trim();
		user.phone = u;
		user.address = document.getElementById("tbxRegAddress" + pre).value.trim();
		user.districtID = isBottom ? this.elDistrictB.getValue() : this.elDistrictT.getValue();
		user.cityID = isBottom ? this.elCityB.getValue() : this.elCityT.getValue();

		if (user.firstName == "") {
			alert("Bạn phải nhập họ và lót.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegFirstName" + pre).focus();
			});
			return;
		}
		if (user.lastName == "") {
			alert("Bạn phải nhập tên.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegLastName" + pre).focus();
			});
			return;
		}
		if (user.address == "") {
			alert("Bạn phải nhập địa chỉ.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxRegAddress" + pre).focus();
			});
			return;
		}
		if (user.cityID == null || user.cityID == "") {
			alert("Bạn phải chọn thành phố.", function () {
				if (!isBottom) {
					me.show();
					me.elCityT.showList();
				}
				else {
					me.elCityB.showList();
				}
			});
			return;
		}
		if (user.districtID == null || user.districtID == "") {
			alert("Bạn phải chọn quận huyện.", function () {
				if (!isBottom) {
					me.show();
					me.elDistrictT.showList();
				}
				else {
					me.elDistrictB.showList();
				}
			});
			return;
		}
		if (wv == "") {
			alert("Bạn chưa nhập mã xác nhận.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxWordVerification" + pre).focus();
			});
			return;
		}
		LoaderAjax.show();
		GasHuongDuong.action.registerMember(user, wv, function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getData(response);
			if (data != null) {
				//alert("Đăng ký thành công. Mời bạn vào email vừa đăng ký để kích hoạt tài khoản của bạn.");
				GasHuongDuong.userLogin = data;
				document.getElementById("idFormRegister" + pre).reset();
				ManagerMember.showOrHideMenu();
				me.funcComplet();
				me.hide();
			}
			else {
				me.counter++;
				document.getElementById('regWordVerification' + pre).src = "/ImageWordVerification.ashx?key=RegisterMember&h=20&w=54&l=4&counter=" + me.counter;
			}
		});
	},

	reloadWordVerification: function (isBottom) {
		var elImg = document.getElementById('regWordVerification' + (isBottom ? 'B' : 'T'));
		elImg.src = "/ImageWordVerification.ashx?key=RegisterMember&h=20&w=28&l=2&counter=" + this.counterImgT;
		this.counterImgT++;
	},

	initBottom: function () {
		var me = this;
		this.configDataCity.data = this.listCity;
		this.elCityB = new DropDownListBTD('tbxRegCityB', this.configDataCity, 'tbxRegCityBName');
		this.elCityB.setWidth(140);
		this.elCityB.addEvent(EventNameDDL.change, function (e) {
			var list = [];
			var cityID = me.elCityB.getValue();
			for (var i = 0; i < me.listDistrict.length; i++) {
				var item = me.listDistrict[i];
				if (cityID == item.cityID) {
					var newItem = {
						districtID: item.districtID,
						name: item.name
					};
					list.push(newItem);
				}
			}
			var newConfigDistrict = {
				textSeparator: ", ",
				maxItem: 10,
				mapField:
				{
					value: "districtID",
					text: "name",
					search: "name",
					display: [
						{ field: "name", type: ColummTypeDDL.label }
					]
				},
				data: list
			};
			me.elDistrictB.reloadData(newConfigDistrict);
			me.elDistrictB.reset();
		});
		var newConfigDistrict = {
			textSeparator: ", ",
			maxItem: 10,
			mapField:
			{
				value: "districtID",
				text: "name",
				search: "name",
				display: [
					{ field: "name", type: ColummTypeDDL.label }
				]
			},
			data: []
		};
		this.elDistrictB = new DropDownListBTD('tbxRegDistrictB', newConfigDistrict, 'tbxRegDistrictBName');
		this.elDistrictB.setWidth(140);
	},

	init: function () {
		var me = this;
		this.configDataCity.data = this.listCity;
		this.elCityT = new DropDownListBTD('tbxRegCityT', this.configDataCity, 'tbxRegCityTName');
		this.elCityT.setWidth(140);
		this.elCityT.addEvent(EventNameDDL.change, function (e) {
			var list = [];
			var cityID = me.elCityT.getValue();
			for (var i = 0; i < me.listDistrict.length; i++) {
				var item = me.listDistrict[i];
				if (cityID == item.cityID) {
					var newItem = {
						districtID: item.districtID,
						name: item.name
					};
					list.push(newItem);
				}
			}
			me.configDataDistrict.data = list;
			me.elDistrictT.reloadData(me.configDataDistrict);
			me.elDistrictT.reset();
		});
		this.elDistrictT = new DropDownListBTD('tbxRegDistrictT', this.configDataDistrict, 'tbxRegDistrictTName');
		this.elDistrictT.setWidth(140);
		this.oPopup = new ModalPopup('cRegisterT', 'Đăng ký');
	}
};

ManagerMember.blockNews = {
	cContent: document.getElementById('cBlockNew'),
	elContentPopup: null,
	oPopup: new ModalPopup(),

	loadData: function () {
		var me = this;
		GasHuongDuong.action.getListNews(function (response) {
			var list = GasHuongDuong.getData(response);
			if (list != null) {
				for (var i = 0; i < list.length; i++) {
					me.createItem(i, list[i]);
				}
			}
		})
	},

	showContentNews: function (item) {
		this.oPopup.setTitle(item.title);
		this.elContentPopup.innerHTML = item.content;
		this.oPopup.display();
		this.oPopup.setCenter();
	},

	createItem: function (i, item) {
		var elItem = document.createElement('DIV');
		elItem.className = 'iNews';
		elItem.innerHTML = (i + 1 + ". ") + item.title;
		var me = this;
		utilObj.addEvent(elItem, EventName.click, function (e) {
			me.showContentNews(item);
		});
		this.cContent.appendChild(elItem);
	},

	init: function () {
		var elCon = document.getElementById('cBlockNew');
		this.cBlockNew = document.createElement('div');
		this.cBlockNew.className = 'cBlockNew';
		elCon.appendChild(this.cBlockNew);

		var elTitle = document.createElement('div');
		elTitle.className = 'cTitle';
		elTitle.innerHTML = 'Tin tức';
		this.cBlockNew.appendChild(elTitle);

		var cContent = document.createElement('div');
		cContent.className = 'cContent';
		this.cBlockNew.appendChild(cContent);
		this.cContent = cContent;

		var elContentPopup = document.createElement('div');
		elContentPopup.className = 'cContentNews';
		this.elContentPopup = elContentPopup;
		document.body.appendChild(elContentPopup);

		this.oPopup = new ModalPopup(elContentPopup, 'Nội dung tin');

		this.loadData();
	}
};

ManagerMember.formEditInfo = {
	pathImage: "",

	oIFrameSubmit: null,
	oPopup: new ModalPopup(),
	show: function () {
		this.setInfo();
		this.oPopup.display();
	},
	hide: function () {
		this.oPopup.hide();
	},
	funcComplet: function () {
		this.oIFrameSubmit.reset();
		this.show();
	},
	setInfo: function () {
		if (GasHuongDuong.userLogin.imageUrl != null && GasHuongDuong.userLogin.imageUrl != '') {
			document.getElementById('memberImageUrl').src = this.pathImage + GasHuongDuong.userLogin.imageUrl + "?time=" + (new Date());
		}
		document.getElementById("labelUsername").innerHTML = GasHuongDuong.userLogin.username;
		document.getElementById("tbxEditEmailT").value = GasHuongDuong.userLogin.email;
		document.getElementById("tbxEditFirstNameT").value = GasHuongDuong.userLogin.firstName;
		document.getElementById("tbxEditLastNameT").value = GasHuongDuong.userLogin.lastName;
		document.getElementById("tbxEditAddressT").value = GasHuongDuong.userLogin.address;
		document.getElementById("tbxEditDistrictT").value = GasHuongDuong.userLogin.district;
		document.getElementById("tbxEditCityT").value = GasHuongDuong.userLogin.city;
	},
	submit: function () {
		var me = this;
		LoaderAjax.show();
		this.oIFrameSubmit.submit(function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getDataSyn(response);
			if (data == null) {
				alert("Cập nhật thất bại.");
			}
			else {
				alert("Cập nhật thành công.");
				GasHuongDuong.userLogin = data;
				me.funcComplet();
			}
		});
	},
	getMemberEdit: function () {
		var me = this;
		var oldP = document.getElementById("tbxEditOldPasswordT").value;
		var p = document.getElementById("tbxEditPasswordT").value;
		var reP = document.getElementById("tbxEditRePasswordT").value;
		var e = document.getElementById("tbxEditEmailT").value;
		if (oldP == "") {
			alert("Bạn chưa nhập mật khẩu cũ.", function () {
				document.getElementById("tbxEditOldPasswordT").focus();
			});
			return null;
		}
		oldP = Encoder.MD5(oldP);
		if (p != "") {
			if (p != reP) {
				alert("Bạn phải lại nhập mật khẩu trùng với mật khẩu đầu.", function () {
					document.getElementById("tbxEditRePasswordT").focus();
				});
				return null;
			}
			p = Encoder.MD5(p);
		}
		var user = { username: GasHuongDuong.userLogin.username, password: p, email: e, oldPassword: oldP };
		user.firstName = document.getElementById("tbxEditFirstNameT").value.trim();
		user.lastName = document.getElementById("tbxEditLastNameT").value.trim();
		user.phone = document.getElementById("tbxEditPhoneT").value.trim();
		user.address = document.getElementById("tbxEditAddressT").value.trim();
		user.district = document.getElementById("tbxEditDistrictT").value.trim();
		user.city = document.getElementById("tbxEditCityT").value.trim();
		if (user.firstName == "") {
			alert("Bạn phải nhập họ và lót.", function () {
				document.getElementById("tbxEditFirstNameT").focus();
			});
			return null;
		}
		if (user.lastName == "") {
			alert("Bạn phải nhập tên.", function () {
				document.getElementById("tbxEditLastNameT").focus();
			});
			return null;
		}
		if (user.address == "") {
			alert("Bạn phải nhập địa chỉ.", function () {
				document.getElementById("tbxEditAddressT").focus();
			});
			return null;
		}
		if (user.district == "") {
			alert("Bạn phải nhập quận huyện.", function () {
				document.getElementById("tbxEditDistrictT").focus();
			});
			return null;
		}
		if (user.city == "") {
			alert("Bạn phải nhập thành phố.", function () {
				document.getElementById("tbxEditCityT").focus();
			});
			return null;
		}
		if (!utilObj.isEmail(e)) {
			alert("Bạn chưa nhập email đúng định dạng.", function () {
				document.getElementById("tbxEditEmailT").focus();
			});
			return null;
		}
		return user;
	},
	init: function () {
		var me = this;
		this.oPopup = new ModalPopup('cEditInfoT', 'Cập nhật thông tin');
		if (this.oIFrameSubmit == null) {
			this.oIFrameSubmit = new IFrameSubmit('idFormEditInfoT', function () {
				var member = me.getMemberEdit();
				if (member == null) {
					LoaderAjax.hide();
					return false;
				}
				document.getElementById('hiddenMemberEdit').value = JSON.stringify(member);
				return true;
			});
		}
	}
};

if (typeof pathImageProduct == undefined) {
	var pathImageProduct = "";
}

var Order = {

	listData: {
		head: [
			{ name: "productID", caption: "Mã số", field: "productID", type: ColummType.label, isShow: false, isAllowHide: false, typeUpdate: ColummType.keyUpdate },
			{ name: "imageUrl", caption: "Sản phẩm", field: "imageUrl", type: ColummType.image, path: pathImageProduct, isShow: true, width: 120 },
			{ name: "name", caption: "", field: "name", type: ColummType.label, isShow: true, width: 400 },
			{ name: "price", caption: "Đơn giá", field: "price", type: ColummType.labelNumber, isShow: true, width: 100, widthEdit: 150, typeUpdate: ColummType.number, unit: { text: "đ", isFrontOf: false }, cssItem: 'price' },
			{ name: "w2", caption: "", field: "productID", type: ColummType.label, isShow: true, width: 40, isAllowHide: false },
			{ name: "amount", caption: "Số lượng", field: "amount", type: ColummType.number, isShow: true, width: 80, isAllowHide: false },
			{ name: "func", caption: "", field: "func", type: ColummType.label, isShow: true, width: 30, isAllowHide: false },
			{ name: "w1", caption: "", field: "productID", type: ColummType.label, isShow: true, width: 40, isAllowHide: false },
			{ name: "totalMoney", caption: "Thành tiền", field: "[price] * [amount]", type: ColummType.formula, isShow: true, width: 100, widthEdit: 150, typeUpdate: ColummType.number, isShowTotal: true, cssItem: 'priceTotal', cssHeader: 'priceTotalHeader', unit: { text: "đ", isFrontOf: false } }
		],
		data: []
	},
	gv: new GridViewBTD(),

	isInit: false,

	init: function () {
		if (this.isInit) return;
		this.isInit = true;
		var me = this;
		var elCon = document.getElementById('cMyCart');

		this.gv = new GridViewBTD(elCon, this.listData, "grdOrderGVName");
		// function GridView
		this.gv.isShowAddNew = false; // Show or Hide LinkButton Add New Record
		this.gv.isShowEdit = false; // Show or Hide LinkButton Edit Record
		this.gv.isShowDelete = false; // Show or Hide LinkButton Delete Record
		this.gv.isShowPaging = false; // Show or Hide Paging
		this.gv.isShowTotal = true; // Show or Hide total of Columm
		this.gv.isAllowResizeColumn = false; // Allow Resize Columm
		this.gv.isAllowMoveColumn = false; // Allow Move Columm
		this.gv.isAllowHideColumn = false; // Allow Hide Columm
		this.gv.isAllowStoreCookie = false; // Allow Store width, position, display Column in Cookie
		this.gv.useUpdateDataSystem = false; // Dùng phần thêm mới của hệ thông
		this.gv.isAllowSelectRow = false;

		this.gv.addEvent("amount", EventName.change, function (e) {
			var elCell = e.elementCell; 		// Get current Cell
			var elRow = e.elementRow; 		// Get current Row
			var item = elRow.item; 			// Get current Item
			if (item.amount <= 0) {
				item.amount = item['old-amount'];
				alert('Bạn không nhập được số lượng < 0');
				return;
			}
			var iEdit = {
				productID: item.productID,
				amount: item.amount
			};
			GasHuongDuong.action.updateCart(iEdit, function (response) {
				var data = GasHuongDuong.getData(response);
				if (data == null) return;
				me.view();
			});
		});

		this.gv.addEventForFunction(EventName.rowDataBound, function (e) {
			var elRow = e.elementRow; 		// Get current Row
			var item = elRow.item; 			// Get current Item
			elRow.cells[me.gv.getColumnIndex("w1")].element.innerHTML = '';
			elRow.cells[me.gv.getColumnIndex("w2")].element.innerHTML = '';
			var elAmount = elRow.cells[me.gv.getColumnIndex("func")].element;
			if (elAmount.elDel == null) {
				elAmount.style.textAlign = 'center';
				var elDel = document.createElement('A');
				elDel.href = 'javascript:;';
				elDel.title = "Xóa";
				elDel.className = 'btnDelete';
				elAmount.appendChild(elDel);
				elAmount.elDel = elDel;

				utilObj.addEvent(elDel, EventName.click, function (e) {
					if (!confirm("Bạn có chắc sẽ xóa không?")) return;
					var row = e.elementRow;
					GasHuongDuong.action.removeItemCart(item.productID, function (re) {
						var data = GasHuongDuong.getData(re);
						if (data == null) return;
						me.view();
						me.showOrHideButton();
					});
				});
			}
		});

		this.gv.dataBind();
	},

	calcTotal: function () {
		this.gv.calcTotal();
	},

	showOrHideButton: function () {
		if (this.listData.data.length == 0) {
			document.getElementById('btnCompleteOrder').style.display = document.getElementById('btnPaymentCart').style.display = 'none';
		}
	},

	loadData: function (callback) {
		var me = this;
		LoaderAjax.show();
		GasHuongDuong.action.getListCart(function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getData(response);
			if (data == null) return;
			me.listData.data = data;
			me.gv.reloadData();
			me.calcTotal();
			if (callback != null) {
				callback();
			}
		});
	},

	loadDataOrderSuccess: function (orderID) {
		var me = this;
		LoaderAjax.show();
		GasHuongDuong.action.getListDetailOrder({ listOrder: orderID + "" }, 0, 1000, function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getData(response);
			if (data == null) return;
			me.listData.data = data.list;
			me.gv.reloadData();
			me.calcTotal();
		});
	},

	view: function () {
		this.init();
		this.loadData();
	},

	viewOrderSuccess: function (orderID) {
		this.init();
		this.loadDataOrderSuccess(orderID);
	},

	setInfo: function () {
		document.getElementById("vUserName").innerHTML = GasHuongDuong.userLogin.username;
		document.getElementById("vFullName").innerHTML = GasHuongDuong.userLogin.fullName;
		document.getElementById("vEmail").innerHTML = GasHuongDuong.userLogin.email;
		document.getElementById("vAddress").innerHTML = GasHuongDuong.userLogin.address;
	},

	click: function (productID) {
		var item = {
			productID: productID
		};
		GasHuongDuong.action.addItemCart(item, function (response) {
			var re = GasHuongDuong.getData(response);
			if (re == null) return;
			location.href = "/Dat-Hang";
		});
	},

	showFormRegister: function () {
		if (GasHuongDuong.userLogin == null) {
			var cFormRegisterInfo = document.getElementById('cFormRegisterInfo');
			if (cFormRegisterInfo.style.display == '') {
				$('html, body').animate({ scrollTop: cFormRegisterInfo.offsetTop - 118 }, 500);
				return;
			}
			$(cFormRegisterInfo).fadeIn("slow", function () { });
			$('html, body').animate({ scrollTop: cFormRegisterInfo.offsetTop - 118 }, 500);
		}
		else {
			document.getElementById('cFormRegisterInfo').style.display = 'none';
			this.setInfo();
			var cFormRegisterInfo = document.getElementById('vRegisterInfo');
			if (cFormRegisterInfo.style.display == '') {
				$('html, body').animate({ scrollTop: cFormRegisterInfo.offsetTop - 118 }, 500);
				return;
			}
			$(cFormRegisterInfo).fadeIn("slow", function () { });
			$('html, body').animate({ scrollTop: cFormRegisterInfo.offsetTop - 118 }, 500);
		}
	},

	clickComplete: function () {

		var bill = {};
		bill.fullName = document.getElementById("tbxFullNameOrd").value.trim();
		bill.phone = document.getElementById("tbxPhoneOrd").value.trim();
		bill.address = document.getElementById("tbxAddressOrd").value.trim();

		if (bill.fullName == "") {
			alert("Bạn phải nhập tên.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxFullNameOrd").focus();
			});
			return;
		}
		if (bill.phone == "") {
			alert("Bạn phải số điện thoại.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxPhoneOrd").focus();
			});
			return;
		}
		if (bill.address == "") {
			alert("Bạn phải nhập địa chỉ.", function () {
				if (!isBottom) me.show();
				document.getElementById("tbxAddressOrd").focus();
			});
			return;
		}

		LoaderAjax.show();
		GasHuongDuong.action.orderMyCart(bill, function (response) {
			var data = GasHuongDuong.getData(response);
			if (data == null) {
				LoaderAjax.hide();
				return;
			}
			location.href = "/Dat-Hang-Thanh-Cong?OrderID=" + data.orderID;
		});
	}
};

Order.contactMe = {
	oPopup: new ModalPopup(),
	elProduct: null,
	elSex: null,
	elFullName: null,
	elPhone: null,
	elBtn: null,
	isInit: false,
	productID: 0,

	submit: function () {
		var me = this;
		var o = {};
		o.productID = this.productID;
		if (this.elFullName.value == '') {
			alert('Mời bạn nhập họ và tên.', function () {
				me.elFullName.focus();
			});
			return;
		}
		o.fullName = this.elFullName.value;
		if (this.elPhone.value == '') {
			alert('Mời bạn nhập số điện thoại.', function () {
				me.elPhone.focus();
			});
			return;
		}
		o.phone = this.elPhone.value;
		o.sex = this.elSex.value == "1";
		GasHuongDuong.action.addCallBack(o, function (response) {
			var re = GasHuongDuong.getData(response);
			if (re.hasErrors) return;
			alert('Cám ơn bạn đã gửi thông tin cho chúng tôi, chúng tôi sẽ liện hệ bạn ngay.');
			me.elFullName.value = '';
			me.elPhone.value = '';
			me.hide();
		});
	},

	init: function () {
		if (this.isInit) return;
		this.isInit = true;
		var elCon = document.createElement('div');
		elCon.className = 'cFormFeedback';
		document.body.appendChild(elCon);

		this.elProduct = document.createElement('DIV');
		this.elProduct.style.padding = '10px';
		elCon.appendChild(this.elProduct);

		var elDiv = document.createElement('DIV');
		elDiv.style.padding = '5px';
		elCon.appendChild(elDiv);
		this.elSex = document.createElement('SELECT');
		elDiv.appendChild(this.elSex);
		utilObj.addItemToSelectBox(this.elSex, 'Anh', '1');
		utilObj.addItemToSelectBox(this.elSex, 'Chị', '0');

		var elDiv = document.createElement('DIV');
		elDiv.style.padding = '5px';
		elCon.appendChild(elDiv);
		this.elFullName = document.createElement('INPUT');
		this.elFullName.placeholder = 'Nhập họ và tên';
		elDiv.appendChild(this.elFullName);

		var elDiv = document.createElement('DIV');
		elDiv.style.padding = '5px';
		elCon.appendChild(elDiv);
		this.elPhone = document.createElement('INPUT');
		this.elPhone.placeholder = 'Nhập số điện thoại';
		elDiv.appendChild(this.elPhone);

		var elDiv = document.createElement('DIV');
		elDiv.style.padding = '5px';
		elCon.appendChild(elDiv);
		this.elBtn = document.createElement('a');
		this.elBtn.href = 'javascript:;';
		this.elBtn.className = 'btn';
		this.elBtn.innerHTML = 'Gửi thông tin';
		elDiv.appendChild(this.elBtn);
		var me = this;
		utilObj.addEvent(this.elBtn, EventName.click, function (e) {
			me.submit();
		});

		this.oPopup = new ModalPopup(elCon, 'Dịch vụ hỗ trợ "Tư vấn miễn phí"');

	},

	show: function (productID, productName) {
		this.productID = productID;
		this.init();
		this.elProduct.innerHTML = productName;
		this.oPopup.display();
	},

	hide: function () {
		this.oPopup.hide();
	}
};


var OrderSuccess = {

	listData: {
		head: [
			{ name: "productID", caption: "Mã số", field: "productID", type: ColummType.label, isShow: false, isAllowHide: false, typeUpdate: ColummType.keyUpdate },
			{ name: "imageUrl", caption: "Sản phẩm", field: "imageUrl", type: ColummType.image, path: pathImageProduct, isShow: true, width: 120 },
			{ name: "name", caption: "", field: "name", type: ColummType.label, isShow: true, width: 400 },
			{ name: "price", caption: "Đơn giá", field: "price", type: ColummType.labelNumber, isShow: true, width: 100, widthEdit: 150, typeUpdate: ColummType.number, unit: { text: "đ", isFrontOf: false }, cssItem: 'price' },
			{ name: "w2", caption: "", field: "productID", type: ColummType.label, isShow: true, width: 40, isAllowHide: false },
			{ name: "amount", caption: "Số lượng", field: "amount", type: ColummType.labelNumber, isShow: true, width: 80, isAllowHide: false },
			{ name: "w1", caption: "", field: "productID", type: ColummType.label, isShow: true, width: 40, isAllowHide: false },
			{ name: "totalMoney", caption: "Thành tiền", field: "[price] * [amount]", type: ColummType.formula, isShow: true, width: 100, widthEdit: 150, typeUpdate: ColummType.number, isShowTotal: true, cssItem: 'priceTotal', cssHeader: 'priceTotalHeader', unit: { text: "đ", isFrontOf: false } }
		],
		data: []
	},
	gv: new GridViewBTD(),

	isInit: false,

	init: function () {
		if (this.isInit) return;
		this.isInit = true;
		var me = this;
		var elCon = document.getElementById('cMyCart');

		this.gv = new GridViewBTD(elCon, this.listData, "grdOrderGVName1");
		// function GridView
		this.gv.isShowAddNew = false; // Show or Hide LinkButton Add New Record
		this.gv.isShowEdit = false; // Show or Hide LinkButton Edit Record
		this.gv.isShowDelete = false; // Show or Hide LinkButton Delete Record
		this.gv.isShowPaging = false; // Show or Hide Paging
		this.gv.isShowTotal = true; // Show or Hide total of Columm
		this.gv.isAllowResizeColumn = false; // Allow Resize Columm
		this.gv.isAllowMoveColumn = false; // Allow Move Columm
		this.gv.isAllowHideColumn = false; // Allow Hide Columm
		this.gv.isAllowStoreCookie = false; // Allow Store width, position, display Column in Cookie
		this.gv.useUpdateDataSystem = false; // Dùng phần thêm mới của hệ thông
		this.gv.isAllowSelectRow = false;


		this.gv.addEventForFunction(EventName.rowDataBound, function (e) {
			var elRow = e.elementRow; 		// Get current Row
			var item = elRow.item; 			// Get current Item
			elRow.cells[me.gv.getColumnIndex("w1")].element.innerHTML = '';
			elRow.cells[me.gv.getColumnIndex("w2")].element.innerHTML = '';
		});

		this.gv.dataBind();
	},

	calcTotal: function () {
		this.gv.calcTotal();
	},

	loadData: function (orderID) {
		var me = this;
		LoaderAjax.show();
		GasHuongDuong.action.getListDetailOrder({ listOrder: orderID + "" }, 0, 1000, function (response) {
			LoaderAjax.hide();
			var data = GasHuongDuong.getData(response);
			if (data == null) return;
			me.listData.data = data.list;
			me.gv.reloadData();
			me.calcTotal();
		});
	},

	view: function (orderID) {
		this.init();
		this.loadData(orderID);
	}
};

var dataInit = GasHuongDuong.getDataSyn(GasHuongDuong.action.getInitDataPage());

var PopupPreload = {
	init: function () {

		if (dataInit != null && dataInit.isHideAdvertiseConner) return;

		var elPopupPreload = document.createElement('DIV');
		elPopupPreload.className = 'cPopupPreload';
		elPopupPreload.innerHTML = '<a href="http://gashuongduong.vn" target="_blank"><img width="700" height="400" src="/Resources/Advertises/Preload.png" /></a>';
		var oPopupPreload = new ModalPopup(elPopupPreload, 'Chúc mừng năm mới');
		oPopupPreload.display(); // Call Modal Popup
		oPopupPreload.setZIndex(20000000);
		oPopupPreload.addEvent(EventNameMP.hide, function (e) {
			GasHuongDuong.action.closeAdvertisePreload(function (response) { });
		});
	}
};

$(document).ready(function () {
	GasHuongDuong.init();
	MenuTreeTop.init();
	HomeTabCategory.init();
	/*
	$(document).on("contextmenu", function () {
		return false;
	});
	*/
	//PopupPreload.init();
});

