// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
export function Rule(prob, str) {
	this.probability = prob; // The probability that this Rule will be used when replacing a character in the grammar string
	this.successorString = str; // The string that will replace the char that maps to this Rule
}
//-----------------------------------------------------------------------------------------------------------
// Linked List class:
// fields : head, tail, of the linked list
function LinkedList(node1, node2) {
	this.head = node1; 
	this.tail = node2; 
}

// Node class 
// fields: prev, sym, next (todo: metadata)
function Node(previous, nex, symbol) {
	// sym is a string
	this.sym = symbol;
	this.prev = previous;
	this.next = nex; 
}

// Linked List Functions:

// function to symmetrically link 2 nodes together
// parameters: two Node objects
function linkNodes(node1, node2) {
	node1.next = node2;
	node2.prev = node1; 
}

// A function to expand one of the symbol nodes of the linked list by replacing it with several new nodes. 
// This function should look at the list of rules associated with the symbol in the linked list’s grammar dictionary, 
// then generate a uniform random number between 0 and 1 in order to determine which of the Rules should be used to 
// expand the symbol node. You will refer to a Rule’s probability and compare it to your random number in order to 
// determine which Rule should be chosen.
function findReplace(currNode, linkedList, grammar) {
	// consider all relavant rules 
	var currGram = grammar[currNode.sym];
	

	// using the random number, decide which validRule to choose
	var rand = Math.random();
	var totalRules = currGram.length;
	var accumulatedProb = 0.0; 

	// the chosen Rule - to be updated in the loop
	var chosenRule = currGram[0];

	for (var i = 0; i < currGram.length; i++) {
		// define a range for each of the Rules based on their probability
		if (rand > accumulatedProb && rand <= accumulatedProb + currGram[i].probability) {
			chosenRule = currGram[i];
		}
		accumulatedProb += currGram[i].probability; 
	}

	// create new chain of nodes based on the Rule replacement
	// return the string 
	return chosenRule.successorString;
}

//-----------------------------------------------------------------------------------------------------------

// Turn the string into linked list 
export function stringToLinkedList(input_string) {
	// ex. assuming input_string = "F+X"
	// you should return a linked list where the head is 
	// at Node('F') and the tail is at Node('X')
	if (typeof input_string !== "undefined") {
		var headNode = new Node(null,  null, input_string.charAt(0));
		var prev = headNode;
		var tailNode = headNode;
		for (var i = 1; i < input_string.length; i++) {
			var newNode = new Node(prev, null, input_string.charAt(i));
			tailNode = newNode;
			prev.next = newNode;
			prev = newNode;
		}
	}

	var ll = new LinkedList(headNode, tailNode);
	return ll;
}

// Return a string form of the LinkedList
export function linkedListToString(linkedList) {
	// ex. Node1("F")->Node2("X") should be "FX"
	var result = "";
	var currNode = linkedList.head;
	while (currNode) {
		result += currNode.sym;
		currNode = currNode.next;
	}
	return result;
}

// Given the node to be replaced, 
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList, node, replacementString) {
	var subLinkedList = stringToLinkedList(replacementString);

	// edge case: single axiom
	if (linkedList.head === linkedList.tail) {
		linkedList.head = subLinkedList.head; 
	} else {
		// find the place of node in linkedList
		var curr = linkedList.head;
		while (curr) {
			if (curr === node) {
				// Replace old node with the new subLinkedList.
				if (curr !== linkedList.head) {
					// if current node is not at head, then set curr's previous's next appropriately
					// else, then the sublinkedlist is at the head of the Node
					curr.prev.next = subLinkedList.head;
				}
				// set the previous of the to be the old node's previous 
				subLinkedList.prev = curr.prev; 
				if (curr.next) {
					// if it's in the middle of the linked list, set the next to the current's next
					// else, the tail next will default point to null 
					subLinkedList.tail.next = curr.next;
				}
			}
			curr = curr.next;
		}
	}
}

export default function Lsystem(axiom, grammar, iterations) {
	// default LSystem
	this.axiom = "FY";
	this.grammar = {};
	this.grammar['X'] = [
		new Rule(1.0, '[-FX][+FX]')
	];
	// new grammar rules
	// S[+B][-B][D]FY
	this.grammar['Y'] = [
		// regular case (base branch with dividers)
		new Rule(0.55, 'S[D]FY'),

		// rotate and add smaller branches
		new Rule(0.1, 'S[D][JBW]FY'),
		new Rule(0.1, 'S[D][KBE]FY'),
		new Rule(0.1, 'S[D][+BP]FY'),
		new Rule(0.1, 'S[D][-BQ]FY'),

		// branching behavior in base branch
		new Rule(0.05, 'S[D][LAY]Y')
	];
	this.grammar['A'] = [
		new Rule(1.0, 'S[D]FA')
	];

	this.iterations = 0; 
	
	// Set up the axiom string
	if (typeof axiom !== "undefined") {
		this.axiom = axiom;
	}

	// Set up the grammar as a dictionary that 
	// maps a single character (symbol) to a Rule.
	if (typeof grammar !== "undefined") {
		this.grammar = Object.assign({}, grammar);
	}
	
	// Set up iterations (the number of times you 
	// should expand the axiom in DoIterations)
	if (typeof iterations !== "undefined") {
		this.iterations = iterations;
	}

	// A function to alter the axiom string stored 
	// in the L-system
	this.updateAxiom = function(axiom) {
		// Setup axiom
		if (typeof axiom !== "undefined") {
			this.axiom = axiom;
		}
	}

	// This function returns a linked list that is the result 
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	this.doIterations = function(n) {	
		var origString = this.axiom;

		// base case: empty string
		if (n === 0) {
			var lSystemLL = stringToLinkedList(this.axiom);
		} else {
			// convert original string to nodes
			var lSystemLL = stringToLinkedList(origString);

			for (var i = 0; i < n; i++) {
				// console.log("hi");
				// iterate through the linked list n times
				var currNode = lSystemLL.head;
				while (currNode) {
					// check if the currNode sym has any listings in grammar
					if (this.grammar[currNode.sym]) {
						// then findReplace what string should replace the current node
						var replacementString = findReplace(currNode, lSystemLL, this.grammar);

						// then replaceNode with the new string
						replaceNode(lSystemLL, currNode, replacementString); 
					}
					// go onto the next node
					currNode = currNode.next; 
				}
			}
		}
		return lSystemLL;
	}
}