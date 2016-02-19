var globalKendoObj;
var FCO;
var userPermision;
var superUser = false;
var fields = [];
var columns = [];
var siteLoad = [];
var sourceSites = [];
var sourceDates = [];

$.support.cors = true;
$(document).ready(function () {

    // //local testing values 

    //SHAREPOINT, DEPLOY VERSION
    FCO = $(".hdnBookings").text() != "" ? JSON.parse($(".hdnBookings").text()) : [];

    if (FCO.length > 0) {
        createSourceSitesDropDown();
        createSourceDatesDropDown();
        setDropDowns();

        $(".WeekDate").change(function () {
            if ($(this).val() == 0) {
                clearFilters();
            }
            else {
                applyFilter($(this).attr('class'), $(this).val());
            }
        });

        if (!FCO[0].isAdmin) {
            $(".filters").hide();
        }

        $(FCO).each(function () {

            this.OGName = this.OGName.replace('OG ', '');
            this.RegionName = this.RegionName.replace('Region ', '');
            this.RegionName = this.SiteName.replace('Site ', '');
        });


        if (FCO[0].isAdmin) {
            fields = {
                model: {
                    id: "FCOID",
                    fields: {
                        FCOID: { editable: false, nullable: true },
                        OGName: { field: "OGName", type: "string", editable: false },
                        RegionName: { field: "RegionName", type: "string", editable: false },
                        SiteName: { field: "SiteName", type: "string", editable: false },
                        //ID: { field: "ID", type: "string", defaultValue: siteLoad[0].value, validation: { required: true, min: 0 }, editable: false, nullable: false },
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
                        Total: { type: "number", validation: { required: true, min: 1 }, defaultValue: 0 }
                    }
                },
                data: function (e) {
                    return e;
                }
            };
            columns = [
                { field: "RegionName", width: "200px", title: "Region" },
                { field: "SiteName", width: "200px", title: "Site" },
                { field: "OGName", width: "200px", title: "Operation Group" },
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
                        SiteName: { field: "SiteName", type: "string", editable: false },
                        //ID: { field: "ID", type: "string", defaultValue: siteLoad[0].value, validation: { required: true, min: 0 }, editable: false, nullable: false },
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
                        Total: { type: "number", validation: { required: true, min: 1 }, defaultValue: 0 }
                    }
                },
                data: function (e) {
                    return e;
                }
            };
            columns = [
                { field: "SiteName", width: "200px", title: "Site" },
                //{ field: "ID", width: "200px", values: siteLoad, title: "Site Name" },
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
            pageSize: 50,
            batch: false,
            schema: fields,
        });

        $("#grid").kendoGrid({
            dataSource: dataSource,
            pageable: true,
            columns: columns,
            editable: "inline"
        });

    }
    else {
        $("#grid").text("Sorry, you don't have permissions to display content.");
    }


});

function returnDateWithEspecificTimeZone(timeZoneDiference) {
    d = new Date();
    localTime = d.getTime();
    localOffset = d.getTimezoneOffset() * 60000;
    utc = localTime + localOffset;
    city = utc + (3600000 * timeZoneDiference);
    nd = new Date(city);
    return nd;
}

function setFridayInWeek() {
    var todayDate =  returnDateWithEspecificTimeZone(-6);
    var dayOfTheMonth = todayDate.getDate();
    var dayOfTheWeek = todayDate.getDay();

    switch (dayOfTheWeek) {
        case 0:
            todayDate.setDate(dayOfTheMonth + 5).toLocaleString();
            return todayDate.toLocaleDateString();
            break;
        case 5:
            if (todayDate.getHours() > 23 && todayDate.getMinutes()>59) {
                todayDate.setDate(dayOfTheMonth + 7).toLocaleString();
                return todayDate.toLocaleDateString();
            }
            else {

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
        //alert('Item with SP Id: ' + oListItem.get_id() + " has ben created");
        globalKendoObj.success(globalKendoObj.data);
    }
    else {
        //alert('Item updated!');
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

function setDropDowns() {
    var datesList = $(".WeekDate");
    $(sourceDates).each(function () {
        var opt = document.createElement('option');
        opt.value = this.value;
        opt.innerHTML = this.text;
        //datesList.append(new Option(this.text, this.value));
        datesList.append(opt);
    });
}



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
        if ((today.getHours() > 23 && today.getMinutes() > 59)) {
            today.setDate(today.getDate() + 7);
            return ((today.getMonth() + 1) > 9 ? (today.getMonth() + 1) : "0" + (today.getMonth() + 1)) + "/" + (today.getDate() > 9 ? (today.getDate()) : "0" + today.getDate()) + "/" + today.getFullYear();
        }
        else {
            return ((today.getMonth() + 1) > 9 ? (today.getMonth() + 1) : "0" + (today.getMonth() + 1)) + "/" + (today.getDate() > 9 ? (today.getDate()) : "0" + today.getDate()) + "/" + today.getFullYear();
        }
    } else {
        day = today.getDay();
        friday = today.getDate() - day + (day === 0 ? -6 : 5);
    }
    closest = new Date(today.setDate(friday));

    return ((closest.getMonth() + 1) > 9 ? (closest.getMonth() + 1) : "0" + (closest.getMonth() + 1)) + "/" + (closest.getDate() > 9 ? (closest.getDate()) : "0" + closest.getDate()) + "/" + closest.getFullYear();
}

function createSourceDatesDropDown() {
    var actualDate = closest_friday();
    var actualYear = parseInt(actualDate.split("/")[2]);
    var actualMonth = parseInt(actualDate.split("/")[0]);
    var actualDay = parseInt(actualDate.split("/")[1]);

    //sourceDates.push({ "value": actualDay + "/" + actualMonth + "/" + actualYear, "text": actualDate });
    var x = new Date();
    //set the actual year
    x.setFullYear(actualYear, x.getMonth(), x.getDate());
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
                obj.value = ((x.getDate()) > 9 ? (x.getDate()) : "0" + (x.getDate())) + "/" + ((x.getMonth() + 1) > 9 ? (x.getMonth() + 1) : "0" + (x.getMonth() + 1)) + "/" + x.getFullYear();
                obj.text = ((x.getMonth() + 1) > 9 ? (x.getMonth() + 1) : "0" + (x.getMonth() + 1)) + "/" + ((x.getDate()) > 9 ? (x.getDate()) : "0" + (x.getDate())) + "/" + x.getFullYear();

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
    sourceDates.reverse();
}


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
                obj.Total = 0;
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


function applyFilter(filterField, filterValue) {

    var gridData = $("#grid").data("kendoGrid");

    var currFilterObj = gridData.dataSource.filter();

    var currentFilters = currFilterObj ? currFilterObj.filters : [];

    if (currentFilters && currentFilters.length > 0) {
        for (var i = 0; i < currentFilters.length; i++) {
            if (currentFilters[i].field == filterField) {
                currentFilters.splice(i, 1);
                break;
            }
        }
    }
    var dataType = jQuery.type(filterValue);
    if (dataType != "boolean") {
        var parts = filterValue.split('/');
        //please put attention to the month (parts[1]), Javascript counts months from 0:
        // January - 0, February - 1, etc
        var mydate = new Date(parts[2], parts[1] - 1, parts[0]);

        if (mydate == "Invalid Date" || dataType == "boolean") {
            if (filterValue != "0") {
                if (!isNaN(filterValue)) {
                    var numberToSearch = parseInt(filterValue)
                    currentFilters.push({
                        field: filterField,
                        operator: "eq",
                        value: numberToSearch
                    });
                }
                else {
                    currentFilters.push({
                        field: filterField,
                        operator: "contains",
                        value: filterValue
                    });
                }
            }
        }
        else {
            currentFilters.push({
                field: filterField,
                operator: "eq",
                value: mydate
            });
        }
    }
    else {
        currentFilters.push({
            field: filterField,
            operator: "eq",
            value: filterValue
        });
    }



    gridData.dataSource.filter({
        logic: "and",
        filters: currentFilters
    });

}

function clearFilters() {
    var gridData = $("#grid").data("kendoGrid");
    gridData.dataSource.filter({});
    $("select").val(0);
}