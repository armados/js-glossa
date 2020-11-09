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
                            <input type="number" min="1" oninput="validity.valid||(value='');" class="form-control form-control-sm dataRecNumOfRecords" value="1">
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
            
            <div class="form-check">
                <input class="form-check-input dataBoxUnique" type="checkbox" checked>
                <label class="form-check-label">
                Μοναδικοί
                </label>
            </div>

            <div class="form-check">
            <input class="form-check-input dataBoxRandom" type="checkbox" checked>
            <label class="form-check-label">
              Τυχαίοι
            </label>
          </div> 

          <div class="form-check">
            <input class="form-check-input dataBoxSorted" type="checkbox">
            <label class="form-check-label">
              Ταξινομημένοι
            </label>
          </div> 
        
            <div class="form-group">
                <label for="dataBoxHowMany">Πλήθος στη σειρά:</label>
                <input type="number" class="form-control form-control-sm dataBoxHowMany" value="1">
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
            <input class="form-check-input dataBoxUnique" type="checkbox" checked>
            <label class="form-check-label">
              Μοναδικοί
            </label>
          </div>

          <div class="form-check">
            <input class="form-check-input dataBoxRandom" type="checkbox" checked>
            <label class="form-check-label">
              Τυχαίοι
            </label>
          </div> 

          <div class="form-check">
            <input class="form-check-input dataBoxSorted" type="checkbox">
            <label class="form-check-label">
              Ταξινομημένοι
            </label>
          </div> 

          <label for="dataBoxNumFrom">Από:</label>
          <input type="number" class="form-control form-control-sm dataBoxNumFrom" value="1">

          <label for="dataBoxNumTo">Έως:</label>
          <input type="number" class="form-control form-control-sm dataBoxNumTo" value="10">

          <div class="form-group">
              <label for="dataBoxHowMany">Πλήθος στη σειρά:</label>
              <input type="number" class="form-control form-control-sm dataBoxHowMany" value="1">
          </div>




        </li>
          `);
        return false;
     });

     function getRndInteger(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return (Math.floor(Math.random() * (max - min + 1) ) + min);
      }

     $('#btnGenerateData').click(function() {
        var mlist = $('ul#sortable');

        $('#result').html('');

        var finalOutput = null;

        try {
                
            var result=[];

            mlist.find('.dataRecordLine').each(function(i, li) {
                var mbox=$(this);

                var numOfRecords = mbox.find('.dataRecNumOfRecords').val();
                //console.log('@numOfRecords: ', numOfRecords);

                for (var nor=0; nor<numOfRecords; ++nor) {
                    var sresult=[];

                    mbox.find('.dataRecordBox').each(function(j, li) {
                        var box=$(this);

                        var howMany  = box.find('.dataBoxHowMany').val();
                        var isUnique = box.find('.dataBoxUnique').is(":checked");
                        var isRandom = box.find('.dataBoxRandom').is(":checked");
                        var isSorted = box.find('.dataBoxSorted').is(":checked");

                        if       (box.hasClass('dataRecordBoxTypeChars')) {
                            console.log('@Chars Characters');

                            const arr = ["January", "February", "March", "April", "May", "June", "July"];

                            console.log(arr.length, howMany);

                            if (isUnique && (howMany > arr.length))
                                throw Error('Το πλήθος ξεπερνά το μέγεθος της διαθέσιμης λίστας.');

                            if (isRandom) {
                                for (var i=0; i<howMany; ++i) {
                                    var random;
                                    do {
                                        random = Math.floor(Math.random() * arr.length);
                                    } while (isUnique && sresult.includes(arr[random]));
                                    sresult.push(arr[random]);
                                }
        
                            } else {
                                for (var i=0; i<howMany; ++i) {
                                    sresult.push(arr[i]);
                            }

                        }

                        if (isSorted)
                            sresult.sort();                            
                    
                            
                        } else if  (box.hasClass('dataRecordBoxTypeNumbers')) {
                            console.log('@Numbers Numbers');

                            var numFrom  = box.find('.dataBoxNumFrom').val();
                            var numTo    = box.find('.dataBoxNumTo').val();

                            if (isUnique && (howMany > Math.abs(numTo-numFrom)+1))
                                throw Error('Το πλήθος ξεπερνά το μέγεθος της διαθέσιμης λίστας.');

                            if (isRandom) {
                                for (var i=0; i<howMany; ++i) {
                                    do {
                                        var num = getRndInteger(numFrom, numTo);
                                    } while (isUnique && sresult.includes(num));
                                    sresult.push(num);
                                }
                            } else {
                                num = numFrom;
                                for (var i=0; i<howMany; ++i) {
                                    sresult.push(num);
                                    (numFrom<=numTo)? ++num : --num;
                                }

                            }

                            if (isSorted)
                                sresult.sort((a, b) => a - b);                            
                        }

                        sresult.join(', ');
                    });

                    result.push(sresult);
                }
            });

            finalOutput = result.join(',\n');

        } catch (e) {
            finalOutput = 'Σφάλμα: ' + e.message;
        }


        $('#result').html(finalOutput);
     });



});
