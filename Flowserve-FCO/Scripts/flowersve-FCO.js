var globalKendoObj;
$(document).ready(function () {

    FCO = [
        {
            FCOID: 1,
            WeekDate: "02/02/2016",
            SiteID: "14",
            IDOG: "5",
            IDRegion: "6",
            ID: "14|5|6",
            Total: 18.0000
        },
        {
            FCOID: 2,
            WeekDate: "02/02/2016",
            SiteID: "10",
            IDOG: "14",
            IDRegion: "16",
            ID: "10|14|16",
            Total: 20.0000
        }//,
        //{
        //    FCOID: 3,
        //    WeekDate: "02/02/2016",
        //    SiteID: "10",
        //    IDOG: "15",
        //    IDRegion: "0",
        //    ID: "10|15|0",
        //    Total: 21.0000
        //}
    ];
    var text =
            [
                { "IDSite": 4, "SiteName": "test 2", "IDOG": 15, "OGName": "OG China", "IDRegion": 0, "RegionName": "", "ID": "4|15|0" },
                { "IDSite": 0, "SiteName": "test 2", "IDOG": 15, "OGName": "OG China", "IDRegion": 0, "RegionName": "", "ID": "0|15|0" },
                { "IDSite": 10, "SiteName": "Site Cookeville", "IDOG": 14, "OGName": "OG Process", "IDRegion": 16, "RegionName": "Region Americas","ID":"10|14|16"  },
                { "IDSite": 13, "SiteName": "Test New", "IDOG": 13, "OGName": "OG Test", "IDRegion": 13, "RegionName": "Region Test","ID":"13|13|13"  }
            ];
    var userPermision = text;

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
                    obj.IDRegion = FCO[iPermission].IDRegion;
                    obj.ID = FCO[iPermission].ID;
                    obj.Total = FCO[iPermission].Total;
                }
                else {
                    obj.FCOID = 0;
                    obj.WeekDate = setFridayInWeek();
                    obj.SiteID = permissions[i].IDSite;
                    obj.IDOG = permissions[i].IDOG;
                    obj.IDRegion = permissions[i].IDRegion;
                    obj.ID = permissions[i].ID;
                    //obj.Total = 0
                }
                arrayObj.push(obj);
            }
        }
        return arrayObj;
    };

    function findIdInArray(array, id,regionID) {
        var index=-1
        for (var iArray = 0; iArray < array.length; iArray++) {            
            if (array[iArray].ID === id) {
                index = iArray;
                break;
            }
        }
        return index;
    }

    FCO= mergeFCOwithPermission(userPermision);
    //var userPermision = JSON.parse($(".hdnSites").text());

    var siteLoad = [];

    $(userPermision).each(function () {
        if (this.IDSite > 0) {
            var item = {};
            item.value = (this.IDSite).toString() + "|" + (this.IDOG).toString() + "|" + (this.IDRegion).toString();
            item.text = this.SiteName;
            siteLoad.push(item);
        };
    });

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
                    // on failure
                    //e.error("XHR response", "status code", "error message");
                },
                create: function (e) {
                    // assign an ID to the new item
                    debugger;
                    e.data.FCOID = sampleDataNextID++;
                    // save data item to the original datasource
                    
                    //save to sharepoint
                    globalKendoObj = e;
                    createListItem(e);
                    ///////////

                    // on success
                    //e.success(e.data);
                    // on failure
                    //e.error("XHR response", "status code", "error message");
                },
                update: function (e) {
                    // locate item in original datasource and update it
                    FCO[getIndexById(e.data.FCOID)] = e.data;
                    // on success
                    e.success();
                    // on failure
                    //e.error("XHR response", "status code", "error message");
                },
                destroy: function (e) {
                    // locate item in original datasource and remove it
                    FCO.splice(getIndexById(e.data.FCOID), 1);
                    // on success
                    e.success();
                    // on failure
                    //e.error("XHR response", "status code", "error message");
                }
            },
            error: function (e) {
                // handle data operation error
                alert("Status: " + e.status + "; Error message: " + e.errorThrown);
            },
            pageSize: 10,
            batch: false,
            schema: {
                model: {
                    id: "FCOID",
                    fields: {
                        FCOID: { editable: false, nullable: true },
                        ID: { field: "ID", type: "string", defaultValue: siteLoad[0].value,validation: { required: true, min: 0 }, editable: false, nullable: false },
                        WeekDate: { type: "date", defaultValue: setFridayInWeek(),
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
                            editable:false
                        },
                        Total: { type: "number", validation: { required: true, min: 1 } }
                    }
                }
            },
        });

        $("#grid").kendoGrid({
            dataSource: dataSource,
            pageable: true,
            toolbar: ["create"],
            columns: [
            { field: "ID", width: "200px", values: siteLoad, title: "Site Name" },
            { field: "WeekDate", width: "200px", title: "Week Ending", format: "{0:MM/dd/yyyy}", },
            { field: "Total",width: "200px", title: "Total On-Desk + Booked" },
                { command: ["edit"], title: "&nbsp;", width: "200px" }
            ],
            editable:"inline"
        });
    });
    
});

function setFridayInWeek() {
    var todayDate = new Date;
    var dayOfTheMonth = todayDate.getDate();
    var dayOfTheWeek = todayDate.getDay();

        switch (dayOfTheWeek) {
            case 0:
                todayDate.setDate(dayOfTheMonth - 2).toLocaleString();
                return todayDate.toLocaleDateString();
                break;
            case 5:
                return todayDate.toLocaleDateString();
                break;
            case 6:
                todayDate.setDate(dayOfTheMonth - 1).toLocaleString();
                return todayDate.toLocaleDateString();
                break;
            default:
                todayDate.setDate(dayOfTheMonth + (5 - dayOfTheWeek)).toLocaleString();
                return todayDate.toLocaleDateString();

        

    }
}

function retrieveAllListProperties() {

    var clientContext = new SP.ClientContext(siteUrl);
    var oWebsite = clientContext.get_web();
    this.collList = oWebsite.get_lists();

    clientContext.load(collList);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
}

function onQuerySucceeded() {
    globalKendoObj.data.FCOID = parseInt(oListItem.get_id());
    FCO.push(globalKendoObj.data);
    alert('Item with SP Id: ' + oListItem.get_id()+ " has ben created");
    globalKendoObj.success(globalKendoObj.data);
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
    oListItem.set_item('Title', "probando");
    oListItem.set_item('Site', parseInt(ObjFCO.data.SiteID.split("|")[0]));
    oListItem.set_item('Operating_x0020_Group', parseInt(ObjFCO.data.SiteID.split("|")[1]));
    oListItem.set_item('Region', parseInt(ObjFCO.data.SiteID.split("|")[2]));
    oListItem.set_item('Week', ObjFCO.data.WeekDate);
    oListItem.set_item('Total', ObjFCO.data.Total);

    oListItem.update();

    clientContext.load(oListItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));

}

function dateTimeEditor(container, options) {
    $('<input data-text-field="' + options.field + '" data-value-field="' + options.field + '" data-bind="value:' + options.field + '" data-format="' + options.format + '"/>')
            .appendTo(container)
            .kendoDateTimePicker({});
}