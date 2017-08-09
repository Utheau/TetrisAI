# TetrisAI

**Where Genetic Algorithms and Javascript meet to create a futuristic version of Tetris.**

![tetris8](https://user-images.githubusercontent.com/25878975/28926785-21aee25a-7869-11e7-9985-3b24ee5a8ba5.gif)

               This is a screenshot of the TetrisAI in action at Generation 13
To see the demo live and play with it [go here](https://rawgit.com/Utheau/TetrisAI/master/index.html
) and more important to see a fully evolved generation, and compare the difference between generation 0 and generation 13, press the CTRL key!
               
## What is TetrisAI

The purpose of the project was to use [genetic algorithms](https://en.wikipedia.org/wiki/Genetic_algorithm) in order to simulate the process of genetic evolution, that allows our AI to learn how improve by itself generation after generation.
In our case, the ultimate goal is to reach the highest score possible in less than 500 moves, using all the moves available including potential bonuses (like clearing multiple lines at once) and the informations obtained during the evolution from previous generations.

## Core concepts

The core principals of TetrisAI are the method of genetic algorithms, in order to create, ameliorate and perfectionate the AI.
In brief, genetic algorithms (GA) is a search-based optimization technique based on the principles of **Genetics and Natural Selection**.
GA work by creating a pool or population of 'genomes' that contains multiple 'genes', in our case 60, representing the key parameters and weights of the algorithm. The genetic algorithm uses three main 'type of rules' to create a future generation from the current one: 

- **Selection** select the individuals (parents) that contribute to the population at the next generation
- **Crossover** combine the parents, getting the best fitness from each, in order to create children for the future generation
- **Mutation** applies random changes to the parents genome in order to create a potentially better child

Once the we have our initial population, GA repeatedly modifies it. At each step, the algorithm selects at random genomes from the pool to become parents and uses them to produce children for the future generation but each and everyone of these genomes (parents) is evaluated and a fitness score is produced based on their performance (rating), so only the fittest individuals (the ones with an optimal fitness) will continue the evolution process. 
Over successive generations, our AI will evolve towards an optimal generation that will understand perfectly how the game works, and learns how to optimize the available choices in order to fulfil our 'ultimate goal'.




    
   
