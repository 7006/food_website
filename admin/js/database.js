
$(document).ready(function () {
  cardsLoad();
  checkUserLogin();
showTable();
  $(document).on("click" , ".cards_box" , function(){
    let table = $(this).data("tbl");
    let title = $(this).data("title");
    let modalID = $(this).data("form-modal");
    let url = "js/database/" + table;
    let data = {"action" : "loadTable"}
    window.localStorage.setItem("url" , url );
    window.localStorage.setItem("TableName" , title );
    window.localStorage.setItem("modalId" , modalID );
    MyTable("POST" , url ,data,"json" ,"#DpanelTable")
    $("#DpanelTable .table_heading").html(title+ " Data" )
    $("#DpanelTable .Add_btn").html("Add "+ title )
    $("#DpanelTable .Add_btn").data("modal" , modalID )
})

  function checkUserLogin() {
        
        var data = "<a href='login.php'  >Sign in</a> <a href='register.php'  >sign up</a>";  
        $.ajax({
          type: "GET",
          url: "../database/user_check_login.php",
          data : {action : "check" },
          dataType : "json",
          success: function (response) {
            if(response.action == false){
              data =`<a href='login.php'  >Sign in</a> <a href='register.php'  >sign up</a>`;
              
              
              console.log("please login kro");
            }else{
              if(response.role_id == 1){
                        console.log("welcome admin")
                        $(".userImg").attr("src" , `../database/upload/${response.image}` )
                        
                        $(".userName").html(response.Name)
                      }else{
                          console.log("u are not admin")
    
                  }
                }
              },  
          error: function (response) {
            console.log(response);
          },
        });
      }
      
      $(document).on( "click" , "#logout" ,  function (e) { 
        e.preventDefault();
        
        $.ajax({
          url: "../database/logout.php",
          type: "POST",
          success: function (data) {
            
            if (data == true) {
              
            console.log("logout")  
            window.location.href = "index.php";
          }
          },
        });
      
      });
      function cardsLoad(){
        data = {"action" : "cards"}
        myAjax("POST" , "js/database/cards.php" , data , "json" , "#card_row");

      }  

      function myAjax(type ,url ,data,dataType,res_id){
        $.ajax({
          type: type,
          url: url,
          data: data,
          dataType: dataType,
          success: function (response) {
            
            if(res_id !=""){
           $(res_id).html(response.data); 
            }
            
          }
        });
      };
      
// showing tables      
function showTable(data){
 let url = window.localStorage.getItem("url"),
  modalID = window.localStorage.getItem("modalId"),
        title = window.localStorage.getItem("TableName");
  $("#DpanelTable .table_heading").html(title+ " Data" );
  $("#DpanelTable .Add_btn").html("Add "+ title );
  $("#DpanelTable .Add_btn").data("modal" , modalID );
  MyTable("POST" , url , data , "json" , "#DpanelTable");
}
// pagination start heare
      $(document).on("click" , "#pageNo" , function(e){
                  e.preventDefault();
                 let page_no = $(this).data("page-no")
                  pagination(page_no)
      })
      function pagination(pageNo){
            let url = window.localStorage.getItem("url");
            let PageNo = pageNo;
            let pageLength = window.localStorage.getItem("pageLength");
            let Data = {"start" :PageNo , "length" : pageLength};
            showTable(Data);          

      };
      //  how many  entry show in one table 
      $("#entity_slc").change(function (e) { 
        e.preventDefault();
      
       let limit = $(this).val();
       console.log("enity " + limit)
       entity_per_page(limit)
})
    function entity_per_page(limit){
        var Limit_per_page = limit;
        var data= {"Limit_per_page" : Limit_per_page};
        showTable(data);
    };
    // table searching start here
    $("#TableSearchInput").keyup(function () { 
      let Val = $(this).val();
        let data =  {"search" :Val}
              
              showTable(data);
    });

    // table sorting start here
$(document).on("click" , "#DpanelTable table thead  th" , function(){
      let column = $(this).data("table-th");
      let by = $(this).data("by");
      
       if(by != "DESC"){ 
        $(this).data("by" , "DESC");
         by = "DESC";
        console.log(by)
      }else{ 
      $(this).data("by" , "ASC")
          by = "ASC";
        };

        let Data = {"order" : {"columns":column, "dirs" : by}}
        console.log(Data);   
        sortingTables(Data)
            
} )
    function sortingTables (e){
      let Url = window.localStorage.getItem("url")
      $.ajax({
        type: "POST",
        url: Url,
        data: e,
        dataType: "json",
        beforeSend: function () {
          $(".loading_div").addClass("active")
        },             
        success: function (response) {
          console.log(response)
          createTable(response , "#DpanelTable")
        }
      });
    }
// table ajax here
function MyTable(type ,url ,data,dataType,res_id){
  // var tableRow = ``;
  $.ajax({
    type: type,
    url: url,
    data: data,
    dataType: dataType,
    success: function (response) {
          createTable(response , res_id)
      
    }
  });
};
// table creating here
 function createTable(response , res_id){
  var tableRow = ``;
  if(response.type == "success"){
    var Cols = response.data.col;
    var Rows = response.data.row;
    var tableCol =`<tr>`;
    for (let i of Cols){
          tableCol += `${i}`;   
    }
        tableCol +=`</tr>`;
          var trId =0;
    for(let i of Rows){
      trId++
      tableRow+=`<tr data-trId="${trId}">`;
      for(let j of i){
          tableRow+=`<td>${j}</td>`;
      }
      tableRow+=`</tr>`;
    };
    
    // pagination show
    let pageLink = "";
    let limit_per_page = response.data.length ,
          limit__per_pageLink = 5;
     
    let total_records = response.data.recordsTotal;
    let filterRecords = response.data.recordsFiltered;
    let page_no = parseInt(response.data.start);
    let total_page = Math.ceil((total_records/limit_per_page));
     window.localStorage.setItem("pageLength" , limit_per_page);
    console.log(`totalRecords : ${total_records} TotalPage : ${total_page} limit per page : ${limit_per_page}  page no : ${(page_no)}  prev : ${(page_no -1)} next : ${(page_no  + 1)} `)
    if(page_no >1){
    pageLink += '<li class="page-item"><a class="page-link" id="pageNo" data-page-no="'+(page_no - 1)+'" >prev</a></li>'
    }
    var start = page_no-2,
    end = page_no+2;

if(end>total_page){
    start-=(end-total_page);   //{--------if total page value is greater then 5 then end subtract total page
    end=total_page;                   // Example hy jani     
                                      //  var page_no = 5;
                                      //  var total_page = 10;
                                      //  var start = page_no-2, //start = 3
                                      //     end = page_no+2;    // end = 7 
                                      // if(end>total_page){ //here total page is greater then end value condition true
                                      //     start-=(end-total_page);   // now start value become  1 how? start -=  (7-10) = -3  -- become + start = 3  
                                      //     end=total_page;            // now end value become is end = 10;
                                      // }
                                      // now we start  loop for( i = start (i = 3) or i > end ( 3 >10)  ) {......} 
                                      // console.log(start , end)
                                      // ---------}
}
if(start<=0){
    end+=((start-1)*(-1));
    start=1;
}

end = end>total_page?total_page:end;
    console.log(`end wali link ${end} start wali ${start}` )
    for (let i = start; i <= end ; i++) {
      if(i ==page_no){
          var active = "active"; 
      }else{
        active = "";
      }

      pageLink += '<li class="page-item '+active+'"><a class="page-link" id="pageNo" data-page-no="'+i+'" >'+i+'</a></li>';
    }
    if(total_page > page_no){
    pageLink += '<li class="page-item"><a class="page-link" id="pageNo" data-page-no="'+(page_no + 1)+'" >next</a></li>'
    }

        $(`${res_id} table thead`).html(tableCol);
 $(`${res_id} table tbody`).html(tableRow);
  $(`${res_id} span`).html(`Showing ${filterRecords} records of ${total_records}`)    
 $(`${res_id} .pagination`).html(pageLink);
  
  }else{
    console.log("error")
  }
 };

 //     inserting or editing data in database with ajax

 let formModalName = window.localStorage.getItem("TableName"),
 form = `${formModalName}Form`,
 formBtn = `#${formModalName}Submit`,
  editBtn = `#EditBtn`,
  deleteBtn = `#${formModalName}DelBtn`,
  ModalName = `#${formModalName}Modal`;
   console.log(`modalname = ${formModalName} , form = ${form} , formButton = ${formBtn} `)
           
// insert update or deleted crud start here  
//   getting records of item on dehave Id  click edit button
$(document).on("click" , editBtn  , function(){
  
  let id = $(this).data("id"),
   formModalName = window.localStorage.getItem("TableName"),
  url = `js/database/action/${formModalName}Action.php`,
  ModalNames = `#EditModal`;
  
  console.log(url)
  let data = {"action" : "get" , "id" :id}
        $.ajax({
          type: "POST",
          url: url,
          data: data,
          dataType: "json",
          success: function (response) {
            console.log(response)
            if(response.type == "success"){
                  modalFire(ModalNames);
                  $(`#FormEdit`).html(response.data)
                  showTable();                    
            }
          },
          error : function(err){
            console.log(err);
          }
        });
})
//this function  is used insert and update crud in php, dynamic form single time we making  they getting all  attribute from form  our work is very simple  
$(document).on("submit", `form`, function (e) { 
  e.preventDefault();
  
  let formModalNames = window.localStorage.getItem("TableName");  
          console.log(formModalNames);
              var formId = $(this).attr("id");
              console.log(formId);
          var Data = new FormData(document.getElementById(formId));
          console.log(Data)        ;
          $.ajax({
            type: $(this).attr("method"),
            url: $(this).attr("action"),
            data : Data,
            dataType: "JSON",
          processData: false,
          contentType: false,
          success: function (data)
                  {
                    console.log(data);
                      if(data.type =="success"){
                        $(`${ModalName}`).modal("hide");               
                      }
                      message(data.type, data.msg);
                      cardsLoad();
          
                  },
                  error: function (xhr, desc, err)
                  {
                      console.log(xhr , err)
          
                  }
          });

});
//dynamic deleted button
$(document).on("click" ,deleteBtn , function(e){
  e.preventDefault();
  // alert();
      let id = $(this).data("id"),
      url = `js/database/action/${formModalName}Action.php`,
      data = {"action" : "del" , "id" :id}
      $(this).parent().parent().hide();
  $.ajax({
    type: "POST",
    url: url,
    data: data,
    dataType: "json",
    success: function (response) {
      console.log(response)
      if(response.type == "success"){
            message(response.type ,response.msg)
            cardsLoad()
      }
    }
  });
 
})

 // alert msg
function message( types, txt){
  console.log(`type = ${types} , Text = ${txt}`)
    $("#Model_txt").text(txt);
    $("#MsgModel .modal-title").text(types);
    $("#MsgModel").modal("show")
    window.setTimeout(function(){
      $('#MsgModel').modal('hide');
   }, 2000)

  
}

$(document).on("click" , ".Add_btn" , function (){
  let ModalId = $(this).data("modal")
modalFire(ModalId);
})
function modalFire(id){
  $(id).modal("show"); 
}

function modalHide(id){
  $(id).modal("hide"); 
}





fetch("http://localhost/food_website/database/js/json/Cat_Json_file.json").then((response) => {
  if (response.ok) {
    return response.json();
  }
  throw new Error('Something went wrong');
})
.then((responseJson) => {
  let option = `<option selected> select </option>`;
      console.log(responseJson[2]["cat_name"])
      for(let i=0; i<responseJson.length; i++){
          option +=`<option value="${responseJson[i]["cat_id"]}"> ${responseJson[i]["cat_name"]}</option>`;
      };
    $("#cat_select_input").html(option);  
})

$(document).on("change" , "#cat_select_input" , function()
{
  let cat_id = $(this).val();
fetch("http://localhost/food_website/database/js/json/subCat_Json_file.json").then((response) => {
  if (response.ok) {
    return response.json();
  }
  throw new Error('Something went wrong');
})
.then((responseJson) => {
  let option = `<option selected> select </option>`;
      
      for(let i=0; i<responseJson.length; i++){
          if(responseJson[i]["cat_id"] == cat_id){
            option +=`<option value="${responseJson[i]["scat_id"]}"> ${responseJson[i]["scat_name"]}</option>`;
          }
        
      };
      
    $("#Scat_select_input").removeAttr("disabled");  
    $("#Scat_select_input").html(option);  
})

  

})





  } );
  
  