var globalKendoObj;
var FCO;
var userPermision;
var superUser = false;
var fields = [];
var columns = [];
var siteLoad = [];
$(document).ready(function () {

    FCO = [
        {
            FCOID: 1,
            WeekDate: "02/02/2016",
            SiteID: "14",
            SiteName: "Site 14",
            IDOG: "5",
            OGName: "OG China",
            IDRegion: "6",
            RegionName: "Region Americas",
            ID: "14|5|6",
            Total: 18.0000
        },
        {
            FCOID: 2,
            WeekDate: "02/02/2016",
            SiteID: "10",
            SiteName: "Site 10",
            IDOG: "14",
            OGName: "OG Process",
            IDRegion: "16",
            RegionName: "Region Test",
            ID: "10|14|16",
            Total: 20.0000
        }
    ];

    //local testing values 

    userPermision = [
                { "IDSite": 4, "SiteName": "test 2", "IDOG": 15, "OGName": "OG China", "IDRegion": 0, "RegionName": "" },
                { "IDSite": 0, "SiteName": "test 2", "IDOG": 15, "OGName": "OG China", "IDRegion": 0, "RegionName": "" },
                { "IDSite": 10, "SiteName": "Site Cookeville", "IDOG": 14, "OGName": "OG Process", "IDRegion": 16, "RegionName": "Region Americas", "ID": "10|14|16" },
                { "IDSite": 13, "SiteName": "Test New", "IDOG": 13, "OGName": "OG Test", "IDRegion": 13, "RegionName": "Region Test", "ID": "13|13|13" }
    ];
    //SHAREPOINT, DEPLOY VERSION
    //FCO = $(".hdnBookings").text() != "" ? JSON.parse($(".hdnBookings").text()) : [];
    //userPermision = JSON.parse($(".hdnSites").text());
    var sourceSites = [];
    function createSourceSitesDropDown() {
        var obj;
        for (var iFCO = 0; iFCO < FCO.length; iFCO++) {
            obj = {};
            obj.value = FCO[iFCO].ID;
            obj.text = FCO[iFCO].SiteName;
            sourceSites.push(obj);
        }
    }

    function closest_friday() {
        var today = new Date(), friday, day, closest;

        if (today.getDay() == 5) {
            if (today.getHours() < 22) {
                return today;
            }
        } else {
            day = today.getDay();
            friday = today.getDate() - day + (day === 0 ? -6 : 5);
        }
        closest = new Date(today.setDate(friday));

        return ((closest.getMonth() + 1) > 9 ? (closest.getMonth() + 1) : "0" + (closest.getMonth() + 1)) + "/" + (closest.getDate() > 9 ? (closest.getDate()) : "0" + closest.getDate()) + "/" + closest.getFullYear();
    }

    var sourceDates = [];
    function createSourceDatesDropDown() {
        var actualDate = closest_friday();
        sourceDates.push({"value":actualDate,"text":actualDate});
        var actualYear = parseInt(actualDate.split("/")[2]);
        var actualMonth = parseInt(actualDate.split("/")[0]);
        var actualDay = parseInt(actualDate.split("/")[1]);

        var x = new Date();
        //set the actual year
        x.setFullYear(actualYear, 01, 01);
        //set the actual date
        var y = new Date();
        y.setFullYear(actualYear, actualDay, actualMonth);

        var j = 1;
        var count = 0;

        //getting the all fridays in a financial year
        var obj;
        for (var i = 0; x < y; i += j) {
            if (actualYear == x.getFullYear()) {
                if (x.getDay() == 5) {
                    obj = {}
                    obj.value = ((x.getMonth() + 1) > 9 ? (x.getMonth() + 1) : "0" + (x.getMonth() + 1)) + "/" + ((x.getDate() ) > 9 ? (x.getDate() ) : "0" + (x.getDate() )) + "/" + x.getFullYear();
                    obj.text = ((x.getMonth() + 1) > 9 ? (x.getMonth() + 1) : "0" + (x.getMonth() + 1)) + "/" + ((x.getDate() ) > 9 ? (x.getDate() ) : "0" + (x.getDate() )) + "/" + x.getFullYear();

                    sourceDates.push(obj);
                    //document.write("Date : " + x.getFullYear() + "/" + x.getDate() + "/"
                    //        + (x.getMonth() + 1) + "<br>");
                    x = new Date(x.getTime() - (7 * 24 * 60 * 60 * 1000));
                    j = 7;
                    count++;
                } else {
                    j = 1;
                    x = new Date(x.getTime() + (24 * 60 * 60 * 1000));
                }
            }
            else {
                break;
            }
        }
    }

    createSourceSitesDropDown();
    createSourceDatesDropDown();

    function mergeFCOwithPermission(permissions) {
        var iPermission = -1;
        var obj;
        var arrayObj = [];
        for (var i = 0; i < permissions.length; i++) {
            obj = {};
            if (permissions[i].IDSite > 0) {
                iPermission = findIdInArray(FCO, permissions[i].ID);
                if (iPermission > -1) {
                    obj.FCOID = FCO[iPermission].FCOID;
                    obj.WeekDate = FCO[iPermission].WeekDate;
                    obj.SiteID = FCO[iPermission].SiteID;
                    obj.IDOG = FCO[iPermission].IDOG;
                    obj.OGName = FCO[iPermission].OGName;
                    obj.IDRegion = FCO[iPermission].IDRegion;
                    obj.RegionName = FCO[iPermission].RegionName;
                    obj.ID = FCO[iPermission].ID;
                    obj.Total = FCO[iPermission].Total;
                }
                else {
                    obj.FCOID = 0;
                    obj.WeekDate = setFridayInWeek();
                    obj.SiteID = permissions[i].IDSite;
                    obj.IDOG = permissions[i].IDOG;
                    obj.OGName = permissions[i].OGName;
                    obj.IDRegion = permissions[i].IDRegion;
                    obj.RegionName = permissions[i].RegionName;
                    obj.ID = permissions[i].ID;
                }
                arrayObj.push(obj);
            }
        }
        return arrayObj;
    };

    function findIdInArray(array, id, regionID) {
        var index = -1
        for (var iArray = 0; iArray < array.length; iArray++) {
            if (array[iArray].ID === id) {
                index = iArray;
                break;
            }
        }
        return index;
    }

    $(userPermision).each(function () {
        this.ID = (this.IDSite).toString() + "|" + (this.IDOG).toString() + "|" + (this.IDRegion).toString();
        if (this.IDSite > 0) {
            var item = {};
            item.value = (this.IDSite).toString() + "|" + (this.IDOG).toString() + "|" + (this.IDRegion).toString();
            item.text = this.SiteName;
            siteLoad.push(item);
        };
    });

    FCO = mergeFCOwithPermission(userPermision);

    if (userPermision[0].IsAdmin) {
        fields = {
            model: {
                id: "FCOID",
                fields: {
                    FCOID: { editable: false, nullable: true },
                    OGName: { field: "OGName", type: "string", editable: false },
                    RegionName: { field: "RegionName", type: "string", editable: false },
                    ID: { field: "ID", type: "string", defaultValue: siteLoad[0].value, validation: { required: true, min: 0 }, editable: false, nullable: false },
                    WeekDate: {
                        type: "date", defaultValue: setFridayInWeek(),
                        validation: {
                            required: true,
                            weekdatevalidation: function (input) {
                                if (input.is("[name='WeekDate']") && input.val() != "") {
                                    var inputDate = new Date(input.val());
                                    var todayDate = new Date();
                                    var dayOfTheWeek = new Date().getDay();
                                    if (dayOfTheWeek != 5) {
                                        input.attr("data-weekdatevalidation-msg", "User is not allowed to change date");
                                        input.val(setFridayInWeek());
                                        return true;
                                    }
                                    else {
                                        input.val(setFridayInWeek());
                                        return true;
                                    }
                                    return true;
                                }
                                return true;
                            }
                        },
                        editable: false
                    },
                    Total: { type: "number", validation: { required: true, min: 1 } }
                }
            }
        };
        columns = [
            { field: "RegionName", width: "200px", title: "Region" },
            { field: "OGName", width: "200px", title: "Operation Group" },
            { field: "ID", width: "200px", values: siteLoad, title: "Site Name" },
            { field: "WeekDate", width: "200px", title: "Week Ending", format: "{0:MM/dd/yyyy}" },
            { field: "Total", width: "200px", title: "Total On-Desk + Booked" },
                { command: ["edit"], title: "&nbsp;", width: "200px" }
        ];
    }
    else {
        fields = {
            model: {
                id: "FCOID",
                fields: {
                    FCOID: { editable: false, nullable: true },
                    ID: { field: "ID", type: "string", defaultValue: siteLoad[0].value, validation: { required: true, min: 0 }, editable: false, nullable: false },
                    WeekDate: {
                        type: "date", defaultValue: setFridayInWeek(),
                        validation: {
                            required: true,
                            weekdatevalidation: function (input) {
                                if (input.is("[name='WeekDate']") && input.val() != "") {
                                    var inputDate = new Date(input.val());
                                    var todayDate = new Date();
                                    var dayOfTheWeek = new Date().getDay();
                                    if (dayOfTheWeek != 5) {
                                        input.attr("data-weekdatevalidation-msg", "User is not allowed to change date");
                                        input.val(setFridayInWeek());
                                        return true;
                                    }
                                    else {
                                        input.val(setFridayInWeek());
                                        return true;
                                    }
                                    return true;
                                }
                                return true;
                            }
                        },
                        editable: false
                    },
                    Total: { type: "number", validation: { required: true, min: 1 } }
                }
            }
        };
        columns = [
            { field: "ID", width: "200px", values: siteLoad, title: "Site Name" },
            { field: "WeekDate", width: "200px", title: "Week Ending", format: "{0:MM/dd/yyyy}" },
            { field: "Total", width: "200px", title: "Total On-Desk + Booked" },
                { command: ["edit"], title: "&nbsp;", width: "200px" }
        ];
    }



    // custom logic start

    var sampleDataNextID = FCO.length + 1;

    function getIndexById(id) {
        var idx,
            l = FCO.length;

        for (var j; j < l; j++) {
            if (FCO[j].ProductID == id) {
                return j;
            }
        }
        return null;
    }

    // custom logic end

    $(document).ready(function () {
        var dataSource = new kendo.data.DataSource({
            transport: {
                read: function (e) {
                    // on success
                    e.success(FCO);
                },
                create: function (e) {
                },
                update: function (e) {
                    // locate item in original datasource and update it
                    if (e.data.FCOID == 0) {
                        globalKendoObj = e;
                        createListItem(e);
                    }
                    else {
                        globalKendoObj = e;
                        updateListItem(e);
                    }
                },
                destroy: function (e) {
                    // locate item in original datasource and remove it
                    FCO.splice(getIndexById(e.data.FCOID), 1);
                    // on success
                    e.success();
                    // on failure
                }
            },
            error: function (e) {
                alert("Status: " + e.status + "; Error message: " + e.errorThrown);
            },
            pageSize: 10,
            batch: false,
            schema: fields,
        });

        $("#grid").kendoGrid({
            dataSource: dataSource,
            pageable: true,
            columns: columns,
            filterable: {
                extra: false
            },
            editable: "inline"
        });
    });

});

function setFridayInWeek() {
    var todayDate = new Date;
    var dayOfTheMonth = todayDate.getDate();
    var dayOfTheWeek = todayDate.getDay();

    switch (dayOfTheWeek) {
        case 0:
            todayDate.setDate(dayOfTheMonth + 5).toLocaleString();
            return todayDate.toLocaleDateString();
            break;
        case 5:
            if (todayDate.getHours() >= 12) {
                return todayDate.toLocaleDateString();
            }
            else {

                todayDate.setDate(dayOfTheMonth + 7).toLocaleString();
                return todayDate.toLocaleDateString();
            }
            break;
        case 6:
            todayDate.setDate(dayOfTheMonth + 6).toLocaleString();
            return todayDate.toLocaleDateString();
            break;
        default:
            todayDate.setDate(dayOfTheMonth + (5 - dayOfTheWeek)).toLocaleString();
            return todayDate.toLocaleDateString();



    }
}

function retrieveAllListProperties() {

    var clientContext = new SP.ClientContext();
    var oWebsite = clientContext.get_web();
    this.collList = oWebsite.get_lists();

    clientContext.load(collList);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
}

function onQuerySucceeded() {
    if (globalKendoObj.data.FCOID == 0) {
        //set in this section the ID on the kendolist/grid that you will get from SP
        globalKendoObj.data.FCOID = parseInt(oListItem.get_id());
        FCO.push(globalKendoObj.data);
        alert('Item with SP Id: ' + oListItem.get_id() + " has ben created");
        globalKendoObj.success(globalKendoObj.data);
    }
    else {
        alert('Item updated!');
        globalKendoObj.success(globalKendoObj.data);
    }
}

function onQueryFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}


function createListItem(ObjFCO) {

    var clientContext = new SP.ClientContext();
    var oList = clientContext.get_web().get_lists().getByTitle('FCO Bookings');//NOMBRE LISTA PARA FCO TODO

    var itemCreateInfo = new SP.ListItemCreationInformation();
    this.oListItem = oList.addItem(itemCreateInfo);

    //TODO NOMBRAR CAMPOS.
    //oListItem.set_item('', reportJson.CountryName);
    oListItem.set_item('Title', "Saved");
    oListItem.set_item('Site', parseInt(ObjFCO.data.ID.split("|")[0]));
    oListItem.set_item('Operating_x0020_Group', parseInt(ObjFCO.data.ID.split("|")[1]));
    oListItem.set_item('Region', parseInt(ObjFCO.data.ID.split("|")[2]));
    oListItem.set_item('Week', ObjFCO.data.WeekDate);
    oListItem.set_item('Total', ObjFCO.data.Total);

    oListItem.update();

    clientContext.load(oListItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));

}

function updateListItem(ObjFCO) {

    var clientContext = new SP.ClientContext();
    var oList = clientContext.get_web().get_lists().getByTitle('FCO Bookings');

    this.oListItem = oList.getItemById(ObjFCO.data.FCOID);

    oListItem.set_item('Total', ObjFCO.data.Total);

    oListItem.update();

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
}

function dateTimeEditor(container, options) {
    $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
            .appendTo(container)
            .kendoDateTimePicker({});
}