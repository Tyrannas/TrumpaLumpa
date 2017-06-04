const fs = require('fs');
const header = "source;target";
const filePath = "../ressources/condensed_20";
const outPath = "../output/edges.csv"


function termFrequency(sentences){
	let tf = {};
	let set = new Set();
	sentences.forEach((s, i) => {
		s.split(' ').forEach(w => {
			if(!set.has(w + i)){
				tf[w] ? tf[w] += 1 : tf[w] = 1;
				set.add(w + i);
			}
		});
	});
	return tf;
}

function tf_idf(sentence, sentences, tf){
	var res = {}
	sentence.forEach(w => {
		res[w] = res[w] ? res[w] + 1 : 1;
	});
	Object.keys(res).forEach(k => {
		res[k] = Math.log(sentences.length / tf[k]) * 1 + Math.log(res[k]);
	})
	return res;
}

function tf_idf_corpus(sentences, treshold=5){
	const termFrenquencies = termFrequency(sentences);
	return sentences.map(sentence => {
		sentence = sentence.split(' ')
		let res = tf_idf(sentence, sentences, termFrenquencies);
		return sentence.filter(w => res[w] > treshold).join(' ');
	});
}

/*
method to remove urls
 */
String.prototype.remove_urls = function(){
	return this.replace(/(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,'');
}

/*
function to remove urls
 */
function remove_urls(sentence){
	return sentence.replace(/(https?:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,'');
}

function cleanString(string){
	return string.toLowerCase().remove_urls().replace(/(\@\w+\s)|[#!?.,;:\n'"\/\\\(\)\-\_\…]/g,' ');
}
/*
transform array of tweets into gephi .csv file
 */
function tweetsToGraph(tweets, filter=false, treshold=3){
	const windowSize = 5;
	tweets = tweets.map(t => cleanString(t));
	tf = termFrequency(tweets);
	tweets.forEach((tweet,i) => {
		tweet = tweet.split(/\s+/);
		if(i % 100 == 0)
			console.log("processing tweet: " + i + "/" + tweets.length)
		if(filter == true){
			res = tf_idf(tweet, tweets, tf);
			tweet = tweet.filter(w => res[w] > treshold)
		}
		fs.appendFileSync("processed_tweets.txt", tweet.join(' ') + '\n')
		// tweet.forEach((word,i,a) => {
		// 	let context = a.slice(i - windowSize, i + windowSize + 1);
		// 	let string = ""
		// 	context.forEach(w => {
		// 		if(w !== word)
		// 			string += "\n" + word + ";" + w;
		// 	});
		// 	fs.appendFileSync(outPath, string);
		// });
	})
}

function main(){
	// init the output file
	fs.writeFileSync(outPath, header);
	for(i = 10; i < 18; ++i){
		// read the tweets
		var tweets = JSON.parse(fs.readFileSync(filePath + i + ".json")).map(e => e.text);
		// process
		tweetsToGraph(tweets, true, 4);
	}
};

main();