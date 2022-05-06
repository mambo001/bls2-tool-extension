window.addEventListener("load", () => {
  const isInit = !localStorage.isInit
      ? localStorage.setItem("isInit", false)
      : console.log("LS.isInit set"),
    isQMRunningInit = !localStorage.isQMRunning
      ? localStorage.setItem("isQMRunning", false)
      : console.log("LS.isQMRunning set"),
    isScraperRunningInit = !localStorage.isScraperRunning
      ? localStorage.setItem("isScraperRunning", false)
      : console.log("LS.isScraperRunning set"),
    superCheckerInit = !localStorage.superCheckerID
      ? localStorage.setItem("superCheckerID", 0)
      : console.log("LS.superCheckerID set");

  const isQMRunning = JSON.parse(localStorage.isQMRunning);
  const isScraperRunning = JSON.parse(localStorage.isScraperRunning);
  const currentIntervalID = JSON.parse(localStorage.superCheckerID);

  // Checks and stops for running scraper
  if (isQMRunning) {
    console.log("started", isQMRunning);
    recurringScrape();
  } else if (isScraperRunning) {
    console.log("stopped", isScraperRunning);
    recurringScrape2();
    // clearInterval(currentIntervalID);
  } else {
    console.log("stopped", isQMRunning);
    clearInterval(currentIntervalID);
  }

  doCheckPageState();

  showFAB();
});

function initScraping(e) {
  // if (!localStorage.autoScrapeDate) {
  //     localStorage.setItem('autoScrapeDate', )
  // }
  // console.log('init',localStorage.isInit)
  // const isInit = JSON.parse(localStorage.isInit);
  const BUTTONS_STYLE = {
    true: {
      text: "Stop",
      color: "#dd6b55",
    },
    false: {
      text: "Start",
      color: "#28a745",
    },
  };

  let isQMRunningObject;
  let isScraperRunningObject;

  const isQMRunning = () => JSON.parse(localStorage.isQMRunning);
  const isScraperRunning = () => JSON.parse(localStorage.isScraperRunning);
  const currentIntervalID = localStorage.superCheckerID
    ? JSON.parse(localStorage.superCheckerID)
    : "";

  isQMRunningObject = BUTTONS_STYLE[isQMRunning()];
  isScraperRunningObject = BUTTONS_STYLE[isScraperRunning()];

  const mainSwalHTML = `
        <div class="divider"></div>
        <div class="progress blue actions-loader hide">
            <div class="indeterminate blue darken-4"></div>
        </div>
        <a style=""
            class="waves-effect waves-light btn-large ${
              isQMRunning() ? "red" : "blue"
            }  scrape-action-btn" id="QMAutoScrapeButton">
        <i class="material-icons left" style="color: #fff;padding: 0 5px;">get_app</i>${
          isQMRunningObject.text
        } QM Auto Scrape
        </a>

        <a style=""
            class="waves-effect waves-light btn-large green scrape-action-btn" id="QMSubmitButton">
        <i class="material-icons left" style="color: #fff;padding: 0 5px;">send</i>Submit
        </a>

        <div class="divider"></div>

        <a style=""
            class="waves-effect waves-light btn-large ${
              isScraperRunning() ? "red" : "blue"
            } darken-2 scrape-action-btn" id="scraperAutoScrapeButton">
        <i class="material-icons left" style="color: #fff;padding: 0 5px;">get_app</i>${
          isScraperRunningObject.text
        } Full Auto Scrape
        </a>

        <a style=""
            class="waves-effect waves-light btn-large green scrape-action-btn" id="scraperSubmitButton">
        <i class="material-icons left" style="color: #fff;padding: 0 5px;">send</i>Submit
        </a>

        <div class="divider"></div>
        `;

  Swal.fire({
    title: 'Select a scrape action below',
    icon: 'info',
    showDenyButton: false,
    showCancelButton: false,
    showCloseButton: true,
    showConfirmButton: false,
    html: mainSwalHTML,
    didRender: () => {
      const loaderElement = document.querySelector('.actions-loader');
      const QMAutoScrapeButton = document.querySelector("#QMAutoScrapeButton");
      const QMSubmitButton = document.querySelector("#QMSubmitButton");
      const scraperAutoScrapeButton = document.querySelector(
        "#scraperAutoScrapeButton"
      );
      const scraperSubmitButton = document.querySelector(
        "#scraperSubmitButton"
      );

      const showLoader = () => loaderElement.classList.remove('hide');
      const hideLoader = () => loaderElement.classList.add('hide');
      const toggleButton = (buttonElement) => buttonElement.toggleAttribute('disabled')

      QMAutoScrapeButton.addEventListener("click", (e) => {
        console.log(e.currentTarget.id);
        // Checks and stops for running scraper
        if (!isQMRunning()) {
            console.log("started", !isQMRunning());
            recurringScrape();
        } else {
            console.log("stopped", !isQMRunning());
            clearInterval(currentIntervalID);
        }

        e.currentTarget.classList.toggle('active')
        localStorage.isQMRunning = !isQMRunning();
      });

      QMSubmitButton.addEventListener("click", async (e) => {
        console.log(e.currentTarget.id);
        const { currentTarget:buttonElement } = e;
        showLoader();
        toggleButton(buttonElement);
        const { message, status } = await doScrape();
        if (status === 200) {
            console.log(status)
            hideLoader()
            toggleButton(buttonElement);
        }
      });

      scraperAutoScrapeButton.addEventListener("click", (e) => {
        console.log(e.currentTarget.id);
        // Checks and stops for running scraper
        if (!isScraperRunning()) {
            console.log("started", !isScraperRunning());
            recurringScrape2();
        } else {
            console.log("stopped", !isScraperRunning());
            clearInterval(currentIntervalID);
        }

        e.currentTarget.classList.toggle('active')
        localStorage.isScraperRunning = !isScraperRunning();
      });

      scraperSubmitButton.addEventListener("click", async (e) => {
        const { currentTarget:buttonElement } = e;
        showLoader();
        toggleButton(buttonElement);
        const { message, status } = await doFullScrape();
        if (status === 200) {
            console.log(status)
            hideLoader()
            toggleButton(buttonElement);
        }
      });
    },
  });
}

function recurringScrape() {
  let currentIntervalID = localStorage.superCheckerID || "";

  // Set Default Page State
  let LS = localStorage;

  // const defaultTimeToResetFlagArray = [4,14,24,34,44,54]
  // const defaultTimeScrapingInterval = [5,6,15,16,25,26,35,36,45,46,55,56]
  // const timeToReloadArray = [5,6,35,36]
  // const timeToscrapeArray = [7,8,9,10,37,38,39,40]
  const timeToReloadArray = [3, 13, 23, 33, 43, 53];
  const timeToscrapeArray = [6, 8, 16, 18, 26, 28, 36, 38, 46, 48, 56, 58];
  const timeToResetFlagArray = [4, 14, 24, 34, 44, 54];

  LS.pageState == undefined ? LS.setItem("pageState", "NULL") : "";
  LS.isSubmitted == undefined ? LS.setItem("isSubmitted", false) : "";

  const timeChecker = (timesToCheckArray) => {
    let currentMinute = new Date().getMinutes();

    return timesToCheckArray.includes(currentMinute);
  };

  const superChecker = setInterval(() => {
    let scrapeState = LS.pageState;
    let isTimeToReload = timeChecker(timeToReloadArray);
    let isTimeToScrape = timeChecker(timeToscrapeArray);
    let isTimeToResetSubmittedFlag = timeChecker(timeToResetFlagArray);
    console.log({
      scrapeState,
      isTimeToScrape,
      isTimeToResetSubmittedFlag,
    });

    if (LS.pageState == "EMPTY") {
      location.reload();
    } else console.log("Page State:", LS.pageState);

    if (isTimeToReload) {
      location.reload();

      isTimeToResetSubmittedFlag ? (LS.isSubmitted = false) : "";
    } else console.log("isTimeToReload:", isTimeToReload);

    if (isTimeToResetSubmittedFlag) {
      LS.isSubmitted = false;
      //   location.reload()
    } else console.log("isSubmitted:", LS.isSubmitted);

    if (isTimeToScrape) {
      console.log("[IN]isTimeToScrape:", isTimeToScrape);
      //   location.reload()
      // if (LS.pageState == "READY" && LS.isSubmitted == "false") {
      if (LS.pageState == "READY") {
        doScrape();
      } else console.log("LS:", LS.isSubmitted);
    } else console.log("[OUT]isTimeToScrape:", isTimeToScrape);
  }, 35000);

  localStorage.superCheckerID = superChecker;
}

function recurringScrape2() {
    let currentIntervalID = localStorage.superCheckerID2 || "";
  
    // Set Default Page State
    let LS = localStorage;
  
    const timeToReloadArray = [
      4, 10, 16, 19, 25,31,
      37, 42, 48, 57
    ];
    const timeToscrapeArray = [
      3, 6, 9, 12, 15, 18, 21, 24, 27, 30,
      33, 36, 39, 41, 44, 47, 50, 53, 56, 59
    ];
    const timeToResetFlagArray = [
      5, 8, 11, 14, 17, 20, 23, 26, 29, 32,
      35, 38, 40, 43, 46, 49, 52, 55, 58
    ];
  
    LS.pageState == undefined ? LS.setItem("pageState", "NULL") : "";
    LS.isSubmitted2 == undefined ? LS.setItem("isSubmitted2", false) : "";
  
    const timeChecker = (timesToCheckArray) => {
      let currentMinute = new Date().getMinutes();
  
      return timesToCheckArray.includes(currentMinute);
    };
  
    const superChecker = setInterval(() => {
      let scrapeState = LS.pageState;
      let isTimeToReload = timeChecker(timeToReloadArray);
      let isTimeToScrape = timeChecker(timeToscrapeArray);
      let isTimeToResetSubmittedFlag = timeChecker(timeToResetFlagArray);
      console.log({
        scrapeState,
        isTimeToScrape,
        isTimeToResetSubmittedFlag,
      });
  
      if (LS.pageState == "EMPTY") {
        location.reload();
      } else console.log("Page State:", LS.pageState);
  
      if (isTimeToReload) {
        location.reload();
  
        isTimeToResetSubmittedFlag ? (LS.isSubmitted2 = false) : "";
      } else console.log("isTimeToReload:", isTimeToReload);
  
      if (isTimeToResetSubmittedFlag) {
        LS.isSubmitted2 = false;
        //   location.reload()
      } else console.log("isSubmitted:", LS.isSubmitted);
  
      if (isTimeToScrape) {
        console.log("[IN]isTimeToScrape:", isTimeToScrape);
        //   location.reload()
        // if (LS.pageState == "READY" && LS.isSubmitted == "false") {
        if (LS.pageState == "READY") {
          doFullScrape()
        } else console.log("LS:", LS.isSubmitted2);
      } else console.log("[OUT]isTimeToScrape:", isTimeToScrape);
    }, 35000);
  
    localStorage.superCheckerID2 = superChecker;
}

function doCheckPageState() {
  let LS = localStorage;
  let TRElements;

  setTimeout(() => {
    TRElements = document.querySelectorAll(".aplos-data-row");
    if (LS.pageState == "NULL" || LS.pageState == "EMPTY") {
      if (!TRElements.length) {
        LS.pageState = "RELOADING";
        location.reload();
        return LS.pageState;
      } else {
        LS.pageState = "READY";
        return LS.pageState;
      }
    } else if (LS.pageState == "RELOADING") {
      setTimeout(() => {
        TRElements = document.querySelectorAll(".aplos-data-row");
        TRElements.length ? (LS.pageState = "READY") : (LS.pageState = "EMPTY");

        return LS.pageState;
      }, 25000);
    } else if (LS.pageState == "READY") {
      console.log(LS.pageState);
      return LS.pageState;
    } else {
      console.log("Invalid State:", LS.pageState);
      return LS.pageState == "INVALID_STATE";
    }
  }, 15000);

  return LS.pageState;
}

function showFAB() {
  const fab = document.createElement("div");
  fab.classList.add("fixed-action-btn", "click-to-toggle");
  fab.style.cssText = `bottom:80px;`;
  fab.innerHTML = `
        <a id="trackBtn" class="btn-floating blue darken-4" style="width: 56px; height: 56px; line-height: 56px; border-radius: 50px;">
          <i class="large material-icons" style="font-size: 24px;">archive</i>
        </a>
    `;
  document.body.appendChild(fab);
  document.querySelector("#trackBtn").addEventListener("click", initScraping);
  addQMModal();
  // document.querySelector("#trackBtn").addEventListener('click', initScrape);
  // document.querySelector("#trackBtn").addEventListener('click', () => location.reload());
  console.log("FAB attached!");

  window.document.onkeydown = (e) => {
    if (e.altKey && e.keyCode == 192) {
        initScraping()
    }
  };
}

function initScrape() {
  // Scrape the page
  doScrape();

  let timerInterval;
  Swal.fire({
    title: `Scraping...`,
    html: "Closing in <b></b> milliseconds.",
    timer: 15000,
    timerProgressBar: true,
    willOpen: () => {
      Swal.showLoading();
      timerInterval = setInterval(() => {
        // const content = Swal.getContent();
        // if (content) {
        //   const b = content.querySelector("b");
        //   if (b) {
        //     b.textContent = Swal.getTimerLeft();
        //   }
        // }
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    /* Read more about handling dismissals below */
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log("I was closed by the timer");
    }
  });
}

async function doScrape() {
    const casesTR = document.querySelectorAll(".aplos-data-row");
    const casesTRArray = Array.from(casesTR);
    const refreshBtn = document.querySelector(".dashboards-refresh");
    let caseData = [];

    if (casesTR.length === 0) refreshBtn.click()
    // Extract text from all initialized
    casesTR.forEach((tr) => {
        const tdArray = Array.from(tr.querySelectorAll(".aplos-table-cell"));
        const tdText = tdArray.map((td) => td.textContent);
        const [
        surveyName,
        surveyLanguage,
        surveyContent,
        surveyURL,
        lastUpdatedTime,
        product,
        ] = tdText;

        caseData.push({
        name: surveyName,
        surveyLanguage: surveyLanguage,
        surveyURL: surveyURL,
        lastUpdatedTime: lastUpdatedTime,
        });
        console.log(tdText);
    });

    console.log({ caseData });

    const { message, status } = await doSubmitToSheet(caseData);
    console.log(message, status)
    if (status === 200) {
        return {
            message,
            status
        }
    }
}

async function doFullScrape() {
    const casesTR = document.querySelectorAll(".aplos-data-row");
    const casesTRArray = Array.from(casesTR);
    const refreshBtn = document.querySelector(".dashboards-refresh");
    let surveyData = [];

    if (casesTR.length === 0) refreshBtn.click()
    // Extract text from all initialized
    casesTR.forEach((tr) => {
    const tdArray = Array.from(tr.querySelectorAll(".aplos-table-cell"));
    const tdText = tdArray.map((td) => td.textContent);
    const [
    surveyName,
    surveyLanguage,
    surveyContent,
    surveyURL,
    lastUpdatedTime,
    product,
    ] = tdText;

    surveyData.push({
    surveyName,
    surveyLanguage,
    surveyContent,
    surveyURL,
    lastUpdatedTime,
    product,
    });

    console.log(tdText);
    });
    console.log({ surveyData });
    const { message, status } = await doSubmitToOtherSheet(surveyData);
    console.log(message, status)
    if (status === 200) {
        return {
            message,
            status
        }
    }
}

function doSubmitToSheet(data) {
  // Fetch Migration to background script
  return new Promise((resolve, reject) =>
    chrome.runtime.sendMessage(
      {
        contentScriptQuery: "submitDashboardCasesQuery",
        postData: data,
      },
      async (data) => {
        if (data.response != "error") {
          // Set LS isSubmitted flag
          localStorage.isSubmitted = true;
          const response = await data;
          resolve(response);
          return response;
        } else {
          console.log("Error:", data.response);
          Swal.fire({
            icon: "error",
            title: "Submission failed!",
            text: "There seems to be a problem in submitting.",
            footer: `<a target="_blank"
href="https://script.google.com/a/macros/google.com/s/AKfycbxivFmpPEs3So4NaC3Lk2BN5iE3ahxF4H4eTt8W-v64/dev?action=read">Authorize the script</a>`,
          });
        }
      }
    )
  );
}

function doSubmitToOtherSheet(data) {
  // Fetch Migration to background script
  return new Promise((resolve, reject) => chrome.runtime.sendMessage(
    {
      contentScriptQuery: "submitSurveyQuery",
      postData: data,
    },
    async (data) => {
      if (data.response != "error") {
        const response = await data;
        resolve(response)
        return response
      } else {
        console.log("Error:", data.response);
        return Swal.fire({
          icon: "error",
          title: "Submission failed!",
          text: "There seems to be a problem in submitting.",
          footer: `<a target="_blank"
href="https://script.google.com/a/macros/google.com/s/AKfycbxivFmpPEs3So4NaC3Lk2BN5iE3ahxF4H4eTt8W-v64/dev?action=read">Authorize the script</a>`,
        });
      }
    }
  ));
}

function addQMModal() {
  let modal = window.document.createElement("div");
  modal.classList.add("m-modal");
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
                                  localStorage.QMScrapeInterval != undefined &&
                                  localStorage.QMScrapeInterval > 0
                                    ? localStorage.QMScrapeInterval
                                    : ""
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


}
