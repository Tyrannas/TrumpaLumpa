import gensim as gs 
import sys 
import codecs
import math

def train_model(input_file, output_name, method='cbow', size=300, window=5, iter=5, min_count=5):
	sentences = gs.models.word2vec.LineSentence(input_file)
	sg = 0
	if method == 'sg':
		sg=1
	model = gs.models.word2vec.Word2Vec(sentences, min_count=min_count, size=size, window=window, sg=sg, iter=iter, sorted_vocab=1)
	model.wv.save_word2vec_format('../models/' + output_name, binary=True)

def transform_to_graph(model_name, nb_vocab=10000):
	with codecs.open('../output/' + model_name + '.csv', 'w') as file:
		file.write("source;target;weight")
	model = gs.models.KeyedVectors.load_word2vec_format('../models/' + model_name, binary=True)
	if nb_vocab == False:
		nb_vocab = len(model.vocab)
	counter = 0
	for k,i in model.vocab.items():
		if counter <= nb_vocab:
			counter += 1
			rows = ''
			for j in model.most_similar_cosmul(k):
				if j[1] > 0.4:
					rows += '\n' + str(k) + ';' + str(j[0]) + ';' + str(0.1 * math.exp(j[1] * 5))
			with codecs.open('../output/' + model_name + '.csv', 'a', 'utf-8-sig') as file:
				file.write(rows)	
		else:
			return

def main():
    # train_model('../ressources/processed_tweets.txt', 'trump_sg', method="sg", size=40, min_count=1, iter=65)
    transform_to_graph('trump_sg', False)


if __name__ == '__main__':
    main()
