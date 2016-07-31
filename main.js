/* jshint node: true, esversion: 6, loopfunc: true */

const http = require('http');
const cheerio = require('cheerio');
const request = require('request');
const officegen = require("officegen");
const docx = officegen('docx');
const fs = require('fs');

function step_1_get_html() {
    request('http://freefutures.org/about/free-team/free-minds-network', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            step_2_parse_html(body);
        }
    });
}

function step_2_parse_html(html_string) {

    var href_list = [];

    var $ = cheerio.load(html_string, {
        xmlMode: true,
        decodeEntities: true
    });
    var al = $("body > div.site-container > div.site-inner > div > main > article > div > figure > a");
    al.each(function (i, elem) {
        href_list.push(elem.attribs.href);
    });

    step_3_wide_get_html_again(href_list);

}

function step_3_wide_get_html_again(hl) {

    var href_list = hl;

    var bio = [];

    function go() {
        if (href_list.length > 0) {
            request(href_list.pop(), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body, {
                        xmlMode: true,
                        decodeEntities: true
                    });
                    bio.push({
                        name: $("body > div.site-container > div.site-inner > div > main > article > header > h1").text(),
                        description: $("body > div.site-container > div.site-inner > div > main > article > div > p:nth-child(3)").text() === "" ? $("body > div.site-container > div.site-inner > div > main > article > div > p:nth-child(2)").text() : $("body > div.site-container > div.site-inner > div > main > article > div > p:nth-child(3)").text()
                    });
                    go();
                }
            });
        } else {
            step_4_create_word(bio);
        }
    }

    go();

}

function step_4_create_word(bio) {

    for (var b of bio) {
        var n = docx.createP();
        n.addText(b.name, {
            font_size: 14,
            bold: true
        });
        var d = docx.createP();
        d.addText(b.description, {
            font_size: 12
        });
    }

    var out = fs.createWriteStream('bio.docx');
    docx.generate(out);
    out.on('close', function () {
        console.log('Finished to create the DOCX file!');
    });
}

step_1_get_html();