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
                                <button class="dropdown-item btn-sm liBtn-char-flnames" type="button">Κείμενο</button>
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
            <p class="bTitle chars">Κείμενο</p>
            <span class="boxRemove">remove</span></span>
                    
            <div class="form-group">
                <label for="dataBoxHowMany">Πλήθος στη σειρά:</label>
                <input type="number" class="form-control form-control-sm dataBoxHowMany" value="1">
            </div>

            <div class="form-check">
                <input class="form-check-input dataBoxUnique" type="checkbox" checked>
                <label class="form-check-label">
                Μοναδικές εγγραφές
                </label>
            </div>

            <div class="form-check">
            <input class="form-check-input dataBoxRandom" type="checkbox" checked>
            <label class="form-check-label">
              Τυχαία σειρά
            </label>
          </div> 

          <div class="form-check">
            <input class="form-check-input dataBoxSorted" type="checkbox">
            <label class="form-check-label">
            Ταξινόμηση
            </label>
          </div> 

          <form>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="dataBoxSortedType" value="0" checked>
            <label class="form-check-label">Αύξουσα</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="dataBoxSortedType" value="1">
            <label class="form-check-label">Φθίνουσα</label>
          </div>
          </form>

          <div class="form-group">
          <label>Επιλογή Λίστας:</label>
          <select class="form-control form-control-sm dataBoxTextList">
            <option value="name-full-lf" selected>Ονοματεπώνυμο</option>
            <option value="name-f">Όνομα</option>
            <option value="name-l">Επίθετο</option>
            <option value="name-ff">Όνομα (μόνο γυναικεία)</option>
            <option value="name-fm">Όνομα (μόνο αντρικά)</option>
            <option value="name-lf">Επίθετο (μόνο γυναικεία)</option>
            <option value="name-lm">Επίθετο (μόνο αντρικά)</option>
            <option value="countries-eu">Ευρωπαικές Χώρες</option>
            <option value="cities-gr">Πόλεις (ελληνικές)</option>
            <option value="custom">Λίστα χρήστη</option>
                        </select>
        </div>

        <div class="form-group">
        <label>Λίστα χρήστη:</label>
        <textarea class="form-control form-control-sm dataBoxTextListCustom rows="2"></textarea>
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

          <div class="form-group">
              <label for="dataBoxHowMany">Πλήθος στη σειρά:</label>
              <input type="number" class="form-control form-control-sm dataBoxHowMany" value="1">
          </div>

          <div class="form-check">
            <input class="form-check-input dataBoxUnique" type="checkbox" checked>
            <label class="form-check-label">
              Μοναδικές εγγραφές
            </label>
          </div>

          <div class="form-check">
            <input class="form-check-input dataBoxRandom" type="checkbox" checked>
            <label class="form-check-label">
             Τυχαία σειρά
            </label>
          </div> 

          <div class="form-check">
            <input class="form-check-input dataBoxSorted" type="checkbox">
            <label class="form-check-label">
              Ταξινόμηση
            </label>
          </div> 

          <form>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="dataBoxSortedType" value="0" checked>
            <label class="form-check-label">Αύξουσα</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="dataBoxSortedType" value="1">
            <label class="form-check-label">Φθίνουσα</label>
          </div>
          </form>


          <label for="dataBoxNumFrom">Από:</label>
          <input type="number" class="form-control form-control-sm dataBoxNumFrom" value="1">

          <label for="dataBoxNumTo">Έως:</label>
          <input type="number" class="form-control form-control-sm dataBoxNumTo" value="10">

          <div class="form-group">
              <label for="dataBoxHowMany">Πλήθος δεκαδικών ψηφίων:</label>
              <input type="number" min="0" max="2" class="form-control form-control-sm dataBoxDecPlaces" value="0">
          </div>



        </li>
          `);
        return false;
     });



      function randomNumberGenerator(min = 0, max = 1, fractionDigits = 0, inclusive = true) {
        const precision = Math.pow(10, Math.max(fractionDigits, 0));
        const scaledMax = max * precision;
        const scaledMin = min * precision;
        const offset = inclusive ? 1 : 0;
        const num = Math.floor(Math.random() * (scaledMax - scaledMin + offset)) + scaledMin;
      
        return num / precision;
      };


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
                        var aresult=[];

                        var box=$(this);

                        var howMany  = box.find('.dataBoxHowMany').val();
                        var isUnique = box.find('.dataBoxUnique').is(":checked");
                        var isRandom = box.find('.dataBoxRandom').is(":checked");
                        var isSorted = box.find('.dataBoxSorted').is(":checked");
                        var isSortedType = $('input[name="dataBoxSortedType"]:checked').val();


                        if       (box.hasClass('dataRecordBoxTypeChars')) {
                            console.log('@Chars Characters');

                            var dataBoxTextList = box.find('.dataBoxTextList').find(":selected").val();
                            console.log(dataBoxTextList);

                            var arr = null;

                            switch(dataBoxTextList) {
                                case 'name-full-lf': var arr = arrNamesFullnamelf.slice(0); break;
                                case 'name-f'      : var arr = arrNamesFirst.slice(0); break;
                                case 'name-l'      : var arr = arrNamesLast.slice(0); break;
                                case 'name-ff'     : var arr = arrNamesFirstFemale.slice(0); break;
                                case 'name-fm'     : var arr = arrNamesFirstMale.slice(0); break;
                                case 'name-lf'     : var arr = arrNamesLastFemale.slice(0); break;
                                case 'name-lm'     : var arr = arrNamesLastMale.slice(0); break;
                                case 'countries-eu': var arr = arrCountriesEurope.slice(0); break;
                                case 'cities-gr'   : var arr = arrCitiesGr.slice(0); break;
                                case 'custom':
                                    var txtList  = box.find('.dataBoxTextListCustom').val();
                                    var arr= txtList.split(',');
                                    arr = arr.map(s => s.trim());
                                    console.log(txtList);
                                    break;
                                default:
                                  throw Error('Μη αποδεκτή τιμή λίστας');
                              }

                            if (isUnique && (howMany > arr.length))
                                throw Error('Το πλήθος ξεπερνά το μέγεθος της διαθέσιμης λίστας.');
    
                            if (!isUnique && !isRandom && (howMany > arr.length))
                                throw Error('Το πλήθος ξεπερνά το μέγεθος της διαθέσιμης λίστας.');

                            if (isRandom) {
                                for (var i=0; i<howMany; ++i) {
                                    var random;
                                    do {
                                        random = Math.floor(Math.random() * arr.length);
                                    } while (isUnique && aresult.includes('\'' + arr[random] + '\''));
                                    
                                    aresult.push( '\'' + arr[random] + '\'' );
                                }
        
                            } else {
                                for (var i=0; i<howMany; ++i) {
                                    aresult.push( '\'' + arr[i] + '\'' );
                            }

                        }

                        if (isSorted) {
                            aresult.sort();    
                            if (isSortedType==1) aresult.reverse();
                        }                        
                    
                            
                        } else if  (box.hasClass('dataRecordBoxTypeNumbers')) {
                            console.log('@Numbers Numbers');

                            var numFrom   = box.find('.dataBoxNumFrom').val();
                            var numTo     = box.find('.dataBoxNumTo').val();
                            var decPlaces = box.find('.dataBoxDecPlaces').val();


                            console.log('allcomb:', (Math.abs(numTo-numFrom))* Math.pow( 10, decPlaces) +1);

                            if (isUnique && (howMany > ((Math.abs(numTo-numFrom))* Math.pow( 10, decPlaces))+1))
                                throw Error('Το πλήθος ξεπερνά το μέγεθος της διαθέσιμης λίστας.');

                            if (isRandom) {
                                for (var i=0; i<howMany; ++i) {
                                    do {
                                        var num = randomNumberGenerator(numFrom, numTo, decPlaces);
                                    } while (isUnique && aresult.includes(num));
                                    aresult.push(num);
                                }
                            } else {
                                num = numFrom;
                                for (var i=0; i<howMany; ++i) {
                                    aresult.push(num);
                                    (numFrom<=numTo)? ++num : --num;
                                }

                            }

                            if (isSorted) {
                                if (isSortedType==0)
                                    aresult.sort((a, b) => a - b); 
                                else
                                    aresult.sort((a, b) => b - a);
                            }                          
                        }

                        aresult.join(', ');

                        if (aresult.length > 0) 
                            sresult.push(aresult);
                    });

                    if (sresult.length > 0) 
                        result.push(sresult);
                }
            });

            result = result.map(row => '! KEYBOARD_INPUT: ' + row);
            
            finalOutput = result.join('\n');

        } catch (e) {
            finalOutput = 'Σφάλμα: ' + e.message;
        }



        $('#result').html(finalOutput);
     });



});
