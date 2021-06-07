
window.addEventListener('load', () => {
    const isInit = !localStorage.isInit 
        ? localStorage.setItem("isInit", false) 
        : console.log('LS.isInit set'),
        isRunningInit = !localStorage.isRunning 
        ? localStorage.setItem("isRunning", false) 
        : console.log('LS.isRunning set'),
        superCheckerInit = !localStorage.superCheckerID 
        ? localStorage.setItem("superCheckerID", 0) 
        : console.log('LS.superCheckerID set');
        
    const isRunning = JSON.parse(localStorage.isRunning);
    const currentIntervalID = JSON.parse(localStorage.superCheckerID);
    
    // Checks and stops for running scraper
    if (isRunning) {
        console.log('started',isRunning)
        recurringScrape()
    } else {
        console.log('stopped',isRunning)
        clearInterval(currentIntervalID)
    }
    
    doCheckPageState()
    
    showFAB();
    
});

function initScraping(e) {
    // if (!localStorage.autoScrapeDate) {
    //     localStorage.setItem('autoScrapeDate', )
    // } 
    // console.log('init',localStorage.isInit)
    // const isInit = JSON.parse(localStorage.isInit);
    
    let isRunningObject;
    

    const isRunning = JSON.parse(localStorage.isRunning);
    const currentIntervalID = localStorage.superCheckerID 
        ? JSON.parse(localStorage.superCheckerID)
        : '';
    
    isRunningObject = isRunning 
        ? {
            buttonText: 'Stop',
            buttonColor: '#dd6b55'
        } 
        : {
            buttonText: 'Start',
            buttonColor: '#28a745'
        }
    
    
    Swal.fire({
    //   title: 'Do you want to save the changes?',
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Submit Now`,
      denyButtonText: `${isRunningObject.buttonText} Auto Scrape`,
      denyButtonColor: `${isRunningObject.buttonColor}`
    }).then((result) => {
      if (result.isConfirmed) {
        initScrape()
      } else if (result.isDenied) {
          
        // Checks and stops for running scraper
        if (!isRunning) {
            console.log('started',!isRunning)
            recurringScrape()
        } else {
            console.log('stopped',!isRunning)
            clearInterval(currentIntervalID)
        }
          
        localStorage.isRunning = !isRunning
        
        
        Swal.fire('Recurring scrape toggled!', '', 'info')
        console.log('isRunning', localStorage.isRunning)
        
      }
    })


}

function recurringScrape(){
    let currentIntervalID = localStorage.superCheckerID || '';

    // Set Default Page State
    let LS = localStorage

    // const defaultTimeToResetFlagArray = [4,14,24,34,44,54]
    // const defaultTimeScrapingInterval = [5,6,15,16,25,26,35,36,45,46,55,56]
    // const timeToReloadArray = [5,6,35,36]
    // const timeToscrapeArray = [7,8,9,10,37,38,39,40]
    const timeToReloadArray = [5,7,15,17,25,27,35,37,45,47,55,57]
    const timeToscrapeArray = [6,8,16,18,26,28,36,38,46,48,56,58]
    const timeToResetFlagArray = [4,14,24,34,44,54]
    


    LS.pageState == undefined ? LS.setItem("pageState", "NULL") : ''
    LS.isSubmitted == undefined ? LS.setItem("isSubmitted", false) : ''
    
    
    
    const timeChecker = (timesToCheckArray) => {
        let currentMinute = new Date().getMinutes()
    
        return timesToCheckArray.includes(currentMinute)
    }
    
    const superChecker = setInterval(() => {
      let scrapeState = LS.pageState
      let isTimeToReload = timeChecker(timeToReloadArray)
      let isTimeToScrape = timeChecker(timeToscrapeArray)
      let isTimeToResetSubmittedFlag = timeChecker(timeToResetFlagArray)
      console.log({
            scrapeState,
            isTimeToScrape,
            isTimeToResetSubmittedFlag
      })
       
      if (LS.pageState == "EMPTY") {
          location.reload()
      } else console.log('Page State:',LS.pageState)
       
      if (isTimeToReload) {
          location.reload()
           
          isTimeToResetSubmittedFlag ? LS.isSubmitted = false : ''
      } else console.log('isTimeToReload:',isTimeToReload)
       
      if (isTimeToResetSubmittedFlag){
          LS.isSubmitted = false
        //   location.reload()
      } else console.log('isSubmitted:', LS.isSubmitted)
       
       
      if (isTimeToScrape){
          console.log("[IN]isTimeToScrape:",isTimeToScrape)
        //   location.reload()
        // if (LS.pageState == "READY" && LS.isSubmitted == "false") {
        if (LS.pageState == "READY") {
              initScrape()
          } else console.log('LS:',LS.isSubmitted)
           
        //   if (LS.isSubmitted == false && LS.pageState == "READY"){
        //       console.log('ye boi');
        //       initScrape()
        //   }
      } else console.log("[OUT]isTimeToScrape:",isTimeToScrape)
       
    }, 35000)
    
    localStorage.superCheckerID = superChecker;
}


function timeChecker(timesToCheckArr){
    let currentMinute = new Date().getMinutes()
    return timesToCheckArray.includes(currentMinute)
}

function doCheckPageState(){
    let LS = localStorage
    let TRElements
    
    setTimeout(() => {
        TRElements = document.querySelectorAll('.aplos-data-row')
        if (LS.pageState == "NULL" || LS.pageState == "EMPTY") {
            
            if(!TRElements.length){
                LS.pageState = "RELOADING"
                location.reload()
                return LS.pageState
            } else {
                LS.pageState = "READY"
                return LS.pageState
            }
            
        } else if (LS.pageState == "RELOADING") {
            setTimeout(() => {
                
                TRElements = document.querySelectorAll('.aplos-data-row')
                TRElements.length 
                    ? LS.pageState = "READY" 
                    : LS.pageState = "EMPTY"
                
                return LS.pageState
            }, 25000);
        } else if (LS.pageState == "READY") {
            console.log(LS.pageState)
            return LS.pageState
        } else {
            console.log("Invalid State:", LS.pageState)
            return LS.pageState == "INVALID_STATE"
        }

    }, 15000);
    
    return LS.pageState
}

function showFAB(){
    const fab = document.createElement('div');
    fab.classList.add('fixed-action-btn', 'click-to-toggle');
    fab.style.cssText = `bottom:80px;`;
    fab.innerHTML = `
        <a id="trackBtn" class="btn-floating blue darken-4" style="width: 56px; height: 56px; line-height: 56px; border-radius: 50px;">
          <i class="large material-icons" style="font-size: 24px;">archive</i>
        </a>
    `;
    document.body.appendChild(fab);
    document.querySelector('#trackBtn').addEventListener('click', initScraping)
    addQMModal()
    // document.querySelector("#trackBtn").addEventListener('click', initScrape);
    // document.querySelector("#trackBtn").addEventListener('click', () => location.reload());
    console.log('FAB attached!');
}

function initScrape(){
    // Scrape the page
    doScrape();
    
    
    
    let timerInterval
    Swal.fire({
      title: `Scraping...`,
      html: 'Closing in <b></b> milliseconds.',
      timer: 15000,
      timerProgressBar: true,
      willOpen: () => {
        Swal.showLoading()
        timerInterval = setInterval(() => {
          const content = Swal.getContent()
          if (content) {
            const b = content.querySelector('b')
            if (b) {
              b.textContent = Swal.getTimerLeft()
            }
          }
        }, 100)
      },
      willClose: () => {
        clearInterval(timerInterval)
      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
      }
    })
}

function doScrape(){
    const casesTR = document.querySelectorAll('.aplos-data-row');
    const casesTRArray = Array.from(casesTR);
    const refreshBtn = document.querySelector('.dashboards-refresh');
    let caseData = [];
    
    if (casesTR.length !== 0){
        // Extract text from all initialized
        casesTR.forEach((tr) => {
            const tdArray = Array.from(tr.querySelectorAll('.aplos-table-cell'));
            const tdText = tdArray.map((td) => td.textContent);

            caseData.push({
                name: tdText[0],
                surveyLanguage: tdText[1],
                surveyURL: tdText[3],
                lastUpdatedTime: tdText[4]
            });
            
            console.log(tdText);
        });
        
        console.log(caseData);
        return doSubmitToSheet(caseData);
    } else {
        // Refresh table if there are no table data
        refreshBtn.click();
    }
}

function doSubmitToSheet(data){
    // Fetch Migration to background script
    chrome.runtime.sendMessage(
        {
            contentScriptQuery: 'submitDashboardCasesQuery',
            postData: data
        },
        data => {
            if (data.response != "error"){
                // Set LS isSubmitted flag
                localStorage.isSubmitted = true
                
                console.log(data);
                Swal.fire("Success!", "Cases has been successfully tracked", "success")
                //document.querySelector('#ni-table-loader').classList.toggle('hide');
                //doCreateSubmittedTable(data.records);
            } else {
                console.log('Error:', data.response);
                Swal.fire({
                    icon: 'error',
                    title: 'Submission failed!',
                    text: 'There seems to be a problem in submitting.',
                    footer: `<a target="_blank"
href="https://script.google.com/a/macros/google.com/s/AKfycbxivFmpPEs3So4NaC3Lk2BN5iE3ahxF4H4eTt8W-v64/dev?action=read">Authorize the script</a>`
                });
            }
        }
    );
}

function addQMModal(){
    let modal = window.document.createElement('div');
      modal.classList.add('m-modal');
      modal.setAttribute("ID", "QMModal");
    //   <h3 class="center-align card-title">QM Scraper</h3>
    // <h4>Scrape Stats</h4>
    // <ul class="collection" id="QMScrapeStat">
    //     <li class="collection-item">Scraped Cases: <span class="right" style="font-weight: bold" id="scrapedCasesSpan">0</span></li>
    //     <li class="collection-item">Swiss Cases: <span class="right" style="font-weight: bold" id="swissCases">0</span></li>
    //     <li class="collection-item">Rejection Email Cases: <span class="right" style="font-weight: bold" id="rejectionEmailCases">0</span></li>
    //     <li class="collection-item">Missing Study ID: <span class="right" style="font-weight: bold" id="missingStudyID">0</span></li>
    // </ul>
    modal.innerHTML = `
    <div class="m-modal-content">
    <small id="QMVersionText" style="margin: 0px 5px">Beta Version 1.2</small>
    <small id="QMScrapeIntervalArrayText" style="margin: 0px 5px">Next scraping <span>[]</span></small>
        <div class="row" style="">
        <div class="col s12 m4">
            <div class="card">
            <div class="progress hide scrape-loader">
                <div class="indeterminate"></div>
            </div>
            <div class="card-content" style="padding: 6px 12px">
                

                <div class="row">
                
                <div class="col s12">


                    <table class="striped highlight responsive-table centered">
                    <thead>
                    <tr>
                        <th>LDAP</th>
                        <th>MTD</th>
                        <th>Status</th>
                        <th>Active Cases</td>
                    </tr>
                    </thead>

                    <tbody id="QMScrapeStat"></tbody>
                </table>
                </div>
                
                
                <div class="col s12 hide" id="QMElevatedInput">
                    <h4 style="margin-top: 12px;">Scrape Configurations</h4>
                    <div class="row">
                        <div class="input-field col s12">
                            <label for="QMScrapeIntervalInput" class="active">Scrape Minute Interval</label>
                            <input id="QMScrapeIntervalInput" type="number" class="validate" min="0" max="60" placeholder="10" 
                                value=${
                                    localStorage.QMScrapeInterval != undefined && localStorage.QMScrapeInterval > 0 
                                    ? localStorage.QMScrapeInterval 
                                    : ''
                                } 
                                required>
                        </div>
                        <div class="input-field col s12 hide">
                            <label for="QMLDAPToScrape" class="active">LDAP</label>
                            <input id="QMLDAPToScrape" type="text" class="validate" placeholder="10" value="me" required>
                        </div>
                    
                        <div class="input-field col s12 m12 l6 hide">
                            <label for="scrapeStartDate" class="active">Start Date</label>
                            <input type="text" id="QMScrapeStartDate" class="datepicker">
                        </div>
                        
                        <div class="input-field col s12 m12 l6 hide">
                            <label for="QMScrapeEndDate" class="active">End Date</label>
                            <input type="text" id="QMScrapeEndDate" class="datepicker">
                        </div>
                        
                        <div class="col s12 hide">
                            <p>
                            <input type="checkbox" id="QMSwissCheckbox" checked/>
                            <label for="QMVersionText">Include Swiss</label>
                            </p>
                        </div>
                        
                        <div class="col s12 hide">
                            <p>
                            <input type="checkbox" id="QMRejectionCheckbox" checked/>
                            <label for="QMRejectionCheckbox">Include Rejection Email</label>
                            </p>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <div class="card-action" style="padding: 6px 12px">
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large blue scrape-action-btn" id="QMscrapeBtn">
                <i class="material-icons left" style="color: #fff;padding: 0 5px;">get_app</i>Scrape Cases
                </a>
                
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large blue darken-4 scrape-action-btn" id="QMAssignCasesBtn">
                <i class="material-icons left" style="color: #fff;padding: 0 5px;">get_app</i>Assign Cases
                </a>
                
                <a style="padding: 0 5px; margin: 5px; display: flex; justify-content: center; align-items: center; color: #fff;"
                    class="waves-effect waves-light btn-large green scrape-action-btn" id="QMsubmitBtn">
                <i class="material-icons left" style="color: #fff;padding: 0 5px;">send</i>Submit
                </a>
            </div>
            </div>
        </div>
        <div class="col s12 m8">
            <div class="card">
            <div class="progress hide scrape-loader">
                <div class="indeterminate"></div>
            </div>
            <table class="striped highlight responsive-table centered">
                <thead>
                <tr>
                    <th>Created Date</th>
                    <th>AR Assign Time</th>
                    <th>LDAP</th>
                    <th>Study ID</th>
                    <th>Case ID</th>
                    <th>Remarks</th>
                    <th>Status</th>
                    <th>Assignee</th>
                </tr>
                </thead>

                <tbody id="QMScrapedTbody"></tbody>
            </table>

            </div>
        </div>
        
        </div>
    
        </div>
    </div>
    `;
    document.body.appendChild(modal);

    window.document.onkeydown = (e) => {
        if(e.altKey && e.which == 87) {
            // open QM scraper
            $('#QMModal').modal('open');
        }
    }
}


