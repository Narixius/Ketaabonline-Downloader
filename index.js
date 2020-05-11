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

(async () => {
  let res = await rp.get("https://ketaabonline.com/");
  const $ = cheerio.load(res);
  let category = $(".container> .row.flex-row.no-margin > div.col.s12.no-margin:not(.footerwidget )");
  for (let i = 0; i < category.length; i++) {
    let catName = $(category[i]).find(".page-title").text();
    console.log("Downloading from Category: " + catName);

    makeDownloadDirectory();

    makeCategoryDirectory(__dirname + "/Download/" + catName);

    let subCategory = $(category[i]).find(".subcatbook__wrap > a");
    for (let j = 0; j < subCategory.length; j++) {
      let page = $(subCategory[j]).attr("href");

      for (let k = 0; k < 20; k++) {
        //downloading from each page
        let pageBody = await rp.get(page + "page/" + (k + 1));
        let $ = cheerio.load(pageBody);
        let booksOnPage = $("a.productlink");
        for (let z = 0; z < booksOnPage.length; z++) {
          console.log("  " + $(booksOnPage[z]).find(".bookcontent_box > h3").text());
          let bookPage = await rp.get($(booksOnPage[z]).attr("href"));
          let $f = cheerio.load(bookPage);
          let url = $f(".downloadandreadbook > a.btn").attr("href");
          let fileName = url.split("/");
          let downloading = await download(encodeURI(url), __dirname + "/Download/" + catName + "/" + fileName[fileName.length - 1]);
          if (downloading !== true) console.log(downloading);
        }
      }
    }
  }
})();
