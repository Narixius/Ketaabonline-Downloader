const request = require("request"),
  download = require("./download"),
  cheerio = require("cheerio"),
  fs = require("fs"),
  rp = require("request-promise");

function makeDownloadDirectory() {
  var dir = __dirname + "/Download";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function makeCategoryDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

function loadLastState(filePath) {
  let data = "0 0 0 0";
  if (fs.existsSync(filePath)) {
    data = fs.readFileSync(filePath, "utf-8");
  }
  return data.split(" ");
}

function saveState(filePath, data) {
  fs.writeFileSync(filePath, data, {
    encoding: "utf8",
    flag: "a+",
    mode: 0o666,
  });
}

(async () => {
  let res = await rp.get("https://ketaabonline.com/");

  const $ = cheerio.load(res);
  let category = $(".container> .row.flex-row.no-margin > div.col.s12.no-margin:not(.footerwidget )");

  let lastState = loadLastState("./state.txt");

  for (let i = parseInt(lastState[0]); i < category.length; i++) {
    let catName = $(category[i]).find(".page-title").text();
    console.log("Downloading from Category: " + catName);

    makeDownloadDirectory();

    makeCategoryDirectory(__dirname + "/Download/" + catName.trim());

    let subCategory = $(category[i]).find(".subcatbook__wrap > a");
    for (let j = parseInt(lastState[1]); j < subCategory.length; j++) {
      let page = $(subCategory[j]).attr("href");

      let subCatName = $(subCategory[j]).find("h3").text();
      makeCategoryDirectory(__dirname + "/Download/" + catName.trim() + "/" + subCatName.trim());
      for (let k = parseInt(lastState[2]); k < 20; k++) {
        //downloading from each page
        let pageBody;
        try {
          pageBody = await rp.get(page + "page/" + (k + 1));
        } catch (e) {
          console.log("page " + (k + 1) + " not found.");
          break;
        }
        let $ = cheerio.load(pageBody);
        let booksOnPage = $("a.productlink");
        for (let z = parseInt(lastState[3]); z < booksOnPage.length; z++) {
          saveState("./state.txt", [i, j, k, z].join(" "));

          console.log("  " + $(booksOnPage[z]).find(".bookcontent_box > h3").text());
          let bookPage = await rp.get($(booksOnPage[z]).attr("href"));
          let $f = cheerio.load(bookPage);
          let url = $f(".downloadandreadbook > a.btn").attr("href");
          let fileName = url.split("/");
          let downloading = await download(encodeURI(url), __dirname + "/Download/" + catName.trim() + "/" + subCatName + "/" + fileName[fileName.length - 1].trim());
          if (downloading !== true) console.log(downloading);
        }
      }
    }
  }
})();
