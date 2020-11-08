$(document).ready(function () {

    $( "#sortable" ).sortable({placeholder: "ui-state-highlight"});
    $( "#sortable" ).disableSelection();

    $( ".sortable2" ).sortable({placeholder: "ui-state-highlight"});
    $( ".sortable2" ).disableSelection();

    $('#btnAddNewMBox').click(function() {
        var list = $('ul#sortable');
        var newItem = `
            
        <li class="ui-state-default dataRecordLine">
              
            <div class="container">

                <div class="row">

                    <div class="col">

                        <div class="btn-group" role="group">
                            <button id="btnGroupDrop1" type="button" class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Εισαγωγή
                            </button>
                            <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                                <button class="dropdown-item btn-sm liBtn-char-flnames" type="button">Ονοματεπώνυμα</button>
                                <button class="dropdown-item btn-sm liBtn-char-fnamesm" type="button">Ονόματα (αντρικά)</button>
                                <button class="dropdown-item btn-sm liBtn-char-fnamesf" type="button">Ονόματα (γυναικεία)</button>
                                <button class="dropdown-item btn-sm liBtn-char-fnames" type="button">Ονόματα (μικτά)</button>
                                <button class="dropdown-item btn-sm liBtn-char-lnamesm" type="button">Επώνυμα (αντρικά)</button>
                                <button class="dropdown-item btn-sm liBtn-char-lnamef" type="button">Επώνυμα (γυναικεία)</button>
                                <button class="dropdown-item btn-sm liBtn-char-lnames" type="button">Επώνυμα (μικτά)</button>
                                <button class="dropdown-item btn-sm liBtn-char-cities" type="button">Πόλεις</button>
                                <button class="dropdown-item btn-sm liBtn-char-countries" type="button">Χώρες</button>
                                <button class="dropdown-item btn-sm liBtn-char-states" type="button">Νομοί</button>
                                <button class="dropdown-item btn-sm liBtn-char-yesno" type="button">Ναι/Όχι</button>
                                <button class="dropdown-item btn-sm liBtn-char-malefemale" type="button">Άντρας/Γυναίκα</button>
                                <button class="dropdown-item btn-sm liBtn-char-malefemaleshort" type="button">Α/Γ</button>
                                <button class="dropdown-item btn-sm liBtn-number-general" type="button">Αριθμός</button>
                            </div>
                        </div>

                    </div> 


                    <div class="col">

                        <div class="form-inline">
                            <label for="formGroupExampleInput" class="col-form-label-sm">Πλήθος εγγραφών: </label>
                            <input type="text" class="form-control form-control-sm" value="1">
                        </div>

                    </div>


                    <div class="col">
                        <span class="boxRemove">remove</span>
                    </div>

                </div> <!-- end of row -->

                <div class="row">   
                    <div class="col">
                        <ul class="sortable2">
                        
                        </ul>
                    </div>
                </div>

            </div>

        </li>

            `;

            list.append(newItem);
            $('.sortable2').sortable( );
     });


    $('#sortable').on('click', '.boxRemove', function() {
        $(this).closest('li').remove();
    });


    $('#sortable').on('click', '.liBtn-char-flnames', function() {
        var list = $(this).closest('li').find('ul.sortable2');
        list.append(`
        <li class="ui-state-default dataRecordBox dataRecordBoxTypeChars">
            <p class="bTitle chars">Όνομα και Επώνυμο</p>
            <span class="boxRemove">remove</span></span>
            

            <div class="form-group">
                <label for="exampleFormControlInput1">Πλήθος:</label>
                <input type="email" class="form-control form-control-sm" id="ddddxampleFormControlInput1" value="1">
            </div>

        </li>`);
        return false;
     });

     $('#sortable').on('click', '.liBtn-number-general', function() {
        var list = $(this).closest('li').find('ul.sortable2');
        list.append(`
        <li class="ui-state-default dataRecordBox dataRecordBoxTypeNumbers">
          <p class="bTitle numbers">Αριθμός</p>
          <span class="boxRemove">remove</span></span>


          <div class="form-check">
            <input class="form-check-input" type="checkbox" checked>
            <label class="form-check-label">
              Μοναδικοί
            </label>
          </div>

          <div class="form-check">
            <input class="form-check-input" type="checkbox" checked>
            <label class="form-check-label">
              Τυχαίοι
            </label>
          </div> 
        
          <label for="exampleFormControlInput1">Από:</label>
          <input type="email" class="form-control form-control-sm" id="exampleFormControlInput1" value="-1000">

          <label for="exampleFormControlInput1">Έως:</label>
          <input type="email" class="form-control form-control-sm" id="exampleFormControlInput1" value="1000">

          <div class="form-group">
              <label for="exampleFormControlInput1">Πλήθος:</label>
              <input type="email" class="form-control form-control-sm" id="ddddxampleFormControlInput1" value="1">
          </div>




        </li>
          `);
        return false;
     });



     $('#btnGenerateData').click(function() {
        var mlist = $('ul#sortable');

        mlist.find('.dataRecordLine').each(function(i, li) {
            //console.log('@Line rec: ', i);

            $(this).find('.dataRecordBox').each(function(j, li) {
                var box=$(this);
                //console.log('@Box: ', j);
                //console.log($(this).prop('outerHTML'));

                if       (box.hasClass('dataRecordBoxTypeChars')) {
                    console.log('@Chars Characters');
                }
                else if  (box.hasClass('dataRecordBoxTypeNumbers')) {
                    console.log('@Chars Numbers');
                }


            });
    
        });


     });



});
