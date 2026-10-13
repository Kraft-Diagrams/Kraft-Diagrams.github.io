import networkx as nx
import matplotlib.pyplot as plt
import itertools
import pandas as pd
from math import gcd

"""
Function build_diagram(q, gamma_sig)
   - q: Dimension size
   - gamma_sig: List of integers holding the signature for the given strata

Return a dictionary containg the graph of the strata with the given indices. Technically, it
returns F and V^{-1}.
"""
def build_diagram(q, gamma_sig):
    
    # Remove any duplicates from the signature and put them in sorted order
    gamma_sig = sorted(list(set(gamma_sig)))
    if len(gamma_sig) != 0 and (gamma_sig[0] <= 0 or gamma_sig[-1] > q):
        print("Invalid strata signature.")
        
    # Compute the signature (a, b)
    b = len(gamma_sig)
    
    # Adding boundary conditions
    gamma_sig.insert(0, 0)
    gamma_sig.append(q+1)
    
    """
    Using a dictionary to store nodes and their connections.
       - The keys will be tuples (i, j) that refer to a node
       - The associated values will initially be set to None
       - Every node should only have one outgoing edge, this edge will be the values 
         in the dictionaries. It will be stored as a tuple, where the first element 
         in the tuple refers to the node its going to, and the second element will 
         be the edge type: F or V.
    
    For example, if Node e_{1, 2} goes to Node e_{2, 3}, and the edge is an F, the 
    key/value pair will be (1, 2):((2, 3), "F")
    """
    
    diagram = {(i, j):None for i in range(1, 3) for j in range(1, q+1)}

    # Add in F edges ----------------------------------------------------------------
    """
    Start adding F(e_{1, j}) edges using the piecewise function:
        F(e_{1, j}) = {0            if j in gamma_sig,
                      {e_{2, j-l}   if u_l < j < u_l+1
    """
    l = 0
    for j in range(1, q+1):
        if j in gamma_sig:
            l += 1
        else:
            diagram[(1, j)] = ((2, j-l), "F")
        
    """
    Start adding F(e_{2, j}) edges using the piecewise function:
        F(e_{2, j}) = {e_{1, j-l+1} if j=q+1-u_l,
                      {0            otherwise
    """
    l = 0
    for u_l in gamma_sig:
        j = q + 1 - u_l
        if 1 <= j <= q:
            diagram[(2, j)] = ((1, b-l+1), "F")
        l += 1

    # Add in V edges ----------------------------------------------------------------
    """
    Start adding V^{-1}(e_{2, j-l}) edges using the piecewise function:
        V(e_{1, j}) = {0          if 1 <= j <= b
                      {e_{2, j-l} if q - u_{l+1} + (l+1) < j <= q - u_l + l
                      
    Remember: We want V^{-1}, not V.
    """
    
    for l in range(b+1):
        start = q - gamma_sig[l+1] + l + 2
        end = q - gamma_sig[l] + l
        for j in range(start, end+1):
            if 1 <= j <= q:
                diagram[(2, j-l)] = ((1, j), "V")
                
    """
    Start adding V^{-1}(e_{1, u_l}) edges using the piecewise function:
        V(e_{2, j}) = {e_{1, u_l} if j = q - b + l
                      {0          otherwise
                      
    Remember: We want V^{-1}, not V.
    """
    for l in range(1, b+1):
        j = q - b + l
        if 1 <= j <= q:
            diagram[(1, gamma_sig[l])] = ((2, j), "V")
        
    return diagram

"""
Function plot_diagram(diagram, gamma=[])
   - diagram: A dictionary created by build_diagram() holding the graph of the strata
   - gamma (optional): List of integers holding the signature for the given strata
   
Uses the dictionary holding the nodes/edges of the strata to display the graph using
networkx
"""
def plot_diagram(diagram, gamma=None):
    q = len(diagram)//2
    
    # If the user gives the strata indices, compute the signature
    if gamma != None:
        b = len(gamma)
        a = q - b
        
    fig, ax = plt.subplots(figsize=(8, int(1.3*q)))
    G = nx.DiGraph()

    # Specify the position where each node should be drawn
    for i in range(1, q+1):
        G.add_node((1, i), pos=(1, (q-i)))
        G.add_node((2, i), pos=(7, (q-i)))

    # Draw the nodes (and their respective labels) of the graph
    # Edges need to be drawn separately
    pos = nx.get_node_attributes(G, 'pos')
    nx.draw_networkx_nodes(G, pos, node_size=2000, node_color="white", edgecolors="black")
    nx.draw_networkx_labels(G, pos)

    # If two nodes point to each other, their edges need to be curved to ensure no overlap
    # All other edges can be straight
    # Also, "F" edges should be orange, and "V" edges should be purple

    # Edges that can be plotted as straight
    straight_edges = [] 
    straight_edge_colors = [] # "orange" for "F" edges, and "purple" for "V" edges

    # Edges that must be plotted curved
    curved_edges = []
    curved_edge_colors = [] # "orange" for "F" edges, and "purple" for "V" edges
    
    for key, val in diagram.items():
        if key == diagram[val[0]][0]:
            curved_edges.append((key, val[0]))
            if val[1] == "F":
                curved_edge_colors.append("orange")
            else:
                curved_edge_colors.append("purple")
        else:
            straight_edges.append((key, val[0]))
            if val[1] == "F":
                straight_edge_colors.append("orange")
            else:
                straight_edge_colors.append("purple")
                
    # Draw the curved edges
    nx.draw_networkx_edges(G, pos, edgelist=curved_edges, arrows=True, connectionstyle="arc3,rad=0.1", edge_color=curved_edge_colors, arrowsize=20, min_source_margin=25, min_target_margin=25, width=2)
    # Draw the straight edges
    nx.draw_networkx_edges(G, pos, edgelist=straight_edges, arrows=True, connectionstyle="arc3,rad=0", edge_color=straight_edge_colors, arrowsize=20, min_source_margin=25, min_target_margin=25, width=2)

    # Remove the black border around the figure
    plt.axis("off")

    # Label the figure
    if not (a == 0 and b == 0 and len(gamma) == 0):
        plt.title(f"Signature ({a}, {b})\n$\\gamma_{{{", ".join([str(i) for i in gamma])}}}$", fontsize=16)
    plt.show()
    plt.savefig("Diagram.png")

"""
Function find_words(diagram)
   - diagram: A dictionary created by build_diagram() holding the graph of the strata

Find the list of words generated by the diagram. Start from each node in the 2nd column and follow
the edges until you reach the starting node.
"""
def find_words(diagram):
    q = len(diagram.keys())//2

    # Store the words here
    word_list = []

    # Keep track of what M1 nodes have already been visited
    visited = [0]*q

    # Cycle through each node in M1, and if it's a node we haven't visited,
    # traverse its path and find its word.
    for i in range(1, q+1):
        # Only find words for nodes not visited yet
        if visited[i-1] == 0: 
            start_node = (2, i)
            cur_node = diagram[start_node][0]
            word = diagram[start_node][1]
            # Follow the edges until we reach the starting node
            while cur_node != start_node:
                word += diagram[cur_node][1]
                cur_node = diagram[cur_node][0]
                # If we encounter a node in the 2nd column, mark it as visited so we don't get duplicate words
                if cur_node[0] == 2:
                    visited[cur_node[1]-1] = 1
            word_list.append(word)
    
    # Find the canonical form of each word
    num_words = len(word_list)
    for i in range(num_words):
        all_shifts = [word_list[i][j:] + word_list[i][:j] for j in range(0, len(word_list[i]), 2)]
        all_shifts.sort()
        word_list[i] = all_shifts[0]

    return word_list

"""
Function NP_slope(word_list)
   - word_list: The list of words (strings) generated by a given strata

Compute the Newton Polygon Slopes. For each word, it is the num_Fs/num_chars
"""
def find_NP_slope(word_list):
    NP_slopes = []
    for word in word_list:
        NP_slopes.append(f"{word.count("F")/len(word)}^{len(word)}")
    return NP_slopes

"""
Function is_decomposable(q, word_list)
   - q: Integer containing the dimension of the Kraft diagram
   - word_list: The list of words (strings) generated by a given strata

Function returns True is the strata is decomposible, and False otherwise
This function does account for the "runny noses," which look indecomposible
but are not.
"""
def is_decomposable(q, word_list):
    if q % 2 and len(word_list) == 1:
        return False
    elif q % 2:
        return True
    if len(word_list) == 2 and word_list[0].count("F") == word_list[1].count("V") and word_list[0] != word_list[1]:
        return False
    return True

"""
Function shifted_complement(word)
   - word: The first word from a even-dimensioned indecomposible strata

Returns the shifted complement of the passed in word
"""
def shifted_complement(word):
    word = word.replace("F", "X").replace("V", "F").replace("X", "V")
    return word[1:]+word[0]


"""
Function Nk_len(N_k)
   - N_k: A list of lists containing nodes in N_k

Returns |N_k|
"""
def Nk_len(N_k):
    return sum([len(word_set) for word_set in N_k])


"""
Function fill_Nk(words, N_k, EO_Map)
   - words: The list of words (strings) generated by a given strata
   - N_k: A list of lists containing nodes in N_k
   - EO_Map: A memoization table where, for every 0 <= k <= 2q, stores |VN_k|, N_k, and |F^{-1}N_k|

A recursive dynamic programming algorithm to compute the EO Type of a given strata.
"""
def fill_Nk(words, N_k, EO_Map):
    # Determine which N_k set we are currently looking at
    cur_index = Nk_len(N_k)
    
    # If we have have visited this spot before, then stop recursing
    if EO_Map[cur_index][1] != None:
        return EO_Map

    # Set N_k
    EO_Map[cur_index][1] = N_k
    
    """
    We must find |VN_k| and |F^{-1}N_k|
    
    N_k is a list of sets, where each set corresponds to a different word from a strata.
    The integers comprising those sets represent nodes corresponding to a word's graph.
    
    To apply V to N_k, we find all indices i such that i-1 \in N_k and word[i-1] == "V" for all words.
    
    To apply F^{-1} to N_k, we take the union of the following sets:
        1) N_k
        2) N_q (aka, all of the V nodes)
        3) {(i+1) % len(word) : i \in N_k}
                       
    We do the application of V and F^{-1} independently for all words in the strata.
    """

    # Find VN_k
    VN_k = []
    for word_index in range(len(words)):
        cur_word_set = N_k[word_index]
        cur_word = words[word_index]
        
        temp_word_set = set()
        for node in cur_word_set:
            # A negative integer modded by a positive integer results in a positive integer in Python
            if (node-1)%len(cur_word) in cur_word_set and cur_word[node-1] == "V":
                temp_word_set.add(node)
        VN_k.append(temp_word_set)
            
    next_index = Nk_len(VN_k)
    EO_Map[cur_index][0] = next_index
    EO_Map = fill_Nk(words, VN_k, EO_Map)

    # Find F^{-1}N_k
    FinvN_k = [] 
    q = len(EO_Map)//2
            
    for word_index in range(len(words)):
        cur_word_set = N_k[word_index]
        cur_word = words[word_index]
        
        # Keep all of our current nodes, and and back in all of the Vs
        # The Vs, by definition, are all going to be at N_q
        temp_word_set = N_k[word_index].union(EO_Map[q][1][word_index])

        # Add back in any connected "F^{-1}" nodes
        # Just adding back in node+1 for all nodes is good enough
        for node in N_k[word_index]:
            temp_word_set.add((node+1)%len(words[word_index])) 
            
        FinvN_k.append(temp_word_set)
        
    prev_index = Nk_len(FinvN_k)
    EO_Map[cur_index][2] = prev_index
    EO_Map = fill_Nk(words, FinvN_k, EO_Map)
    
    return EO_Map


"""
Function fill_EO_gaps(EO_type)
   - EO_type: A list of integers containing the EO_type of a given strata

If not all rows in the EO_type are filled via fill_Nk, use the symmetry properties to fill them
"""
def fill_EO_gaps(EO_type):

    EO_type.insert(0, 0) # Add 0 to the first spot for the boundary condition

    # Move forward through the array
    for i in range(1, len(EO_type)-1):
        # Only fix the EO index if it hasn't been filled
        if EO_type[i] == -1:
        
            # First check if the spots directly before and after the current index are filled
            if EO_type[i-1] >= 0 and EO_type[i+1] >= 0:
                # If their difference is 2, then I can fill the current spot.
                if EO_type[i+1] - EO_type[i-1] == 2:
                    EO_type[i] = EO_type[i-1]+1
                
                # If their difference is 0, then I can also fill the current spot.
                elif EO_type[i+1] - EO_type[i-1] == 0:
                    EO_type[i] = EO_type[i-1]

            # If that doesn't pan out, check if it's sandwiched between 2 of the same number
            else:
                pre_val = -1
                first_half = EO_type[:i]
                first_half.reverse()
                for j in first_half:    # Find the value of the last filled EO_index
                    if j != -1:
                        pre_val = j
                        break
                post_val = -1
                for j in EO_type[i+1:]: # Find the value of the next filled EO_index
                    if j != -1:
                        post_val = j
                        break
                if pre_val == post_val: # If those two values are equal, then this position must also have the same value
                    EO_type[i] = pre_val

    # Now apply asymmetry as needed
    # Forward through the array first
    reversed_EO_type = EO_type[::-1]
    for i in range(1, len(EO_type) - 1):
        if EO_type[i] == -1:
            if reversed_EO_type[i] >= 0 and reversed_EO_type[i-1] >= 0:
                if reversed_EO_type[i-1]-reversed_EO_type[i] == 0:
                    EO_type[i] = EO_type[i-1]+1
                elif reversed_EO_type[i-1]-reversed_EO_type[i] == 1:
                    EO_type[i] = EO_type[i-1]

    # Backwards through the array second
    for i in range(len(EO_type) - 1, 0, -1):
        if EO_type[i] == -1:
            if reversed_EO_type[i] >= 0 and reversed_EO_type[i-1] >= 0:
                if reversed_EO_type[i-1]-reversed_EO_type[i] == 0:
                    EO_type[i] = EO_type[i-1]+1
                elif reversed_EO_type[i-1]-reversed_EO_type[i] == 1:
                    EO_type[i] = EO_type[i-1]
                
    return EO_type[1:]

"""
Function find_EO_type(words)
   - words: The list of words (strings) generated by a given strata

The launcher function for fill_Nk. This function creates the memozation table EO_Map to be filled
"""
def find_EO_type(words):

    q = "".join(words).count("V")

    """
    Each element in the EO_map will correspond to a different EO entry, N_k for 0 <= i <= 2q.
    Each element is a list containing 3 items
        1. The number of elements the resulting set will contain after applying V
        2. The set of elements N_k contains
        3. The number of elements the resulting set will contain after applying F^{-1}
    """
    EO_Map = [[-1, None, 0] for i in range(2*q+1)]
    
    # Initialize boundaries
    EO_Map[0] = [0, None, q]
    N_2q = []
    N_q = []
    for word in words:
        N_2q.append(set([i for i in range(len(word))]))
        N_q.append(set([i for i in range(len(word)) if word[i-1] == "V" ]))
    EO_Map[2*q] = [q, N_2q, 2*q]
    
    EO_Map = fill_Nk(words, N_q, EO_Map) # Recursively fill in the EO_Map, starting from N_{q}
    
    """
    ix = 0
    for item in EO_Map:
        print(f"N_{ix}: {item}")
        ix += 1
    """
    
    EO_type = [EO_Map[i][0] for i in range(1, 2*q+1)] # The EO Type is the 1st column of the EO_Map
    
    # If the recursive method wasn't able to reach all N_k, use symmetry to fill in the blanks
    if -1 in EO_type:
        EO_type = fill_EO_gaps(EO_type)

    return EO_type

def find_all_indecomposables(q, b = -1):
    # Given a dimension q, find all strata that are indecomposable
    indecomposable_strata = {"q":[], "Signature":[], "Gamma Subscripts":[], "Word(s)":[], "EO Type":[], "Hirashita Slope": []}

    if b == -1:
        search_range = list(range(q, -1, -1))
    else:
        search_range = [q - b]
    
    for a in search_range:
        b = q - a
        # Determine all possible strata for signature (a, b)
        if b == 0:
            possible_strata = [[]]
        elif b == 1:
            possible_strata = list(range(1, a+b+1))
            possible_strata = [[item] for item in possible_strata]
        else:
            possible_strata = list(itertools.combinations(list(range(1, a+b+1)), b))
            possible_strata = [list(item) for item in possible_strata]

        # Construct a diagram for all possible strata, and determine whether they are indecomposable
        for strata in possible_strata:
            diagram = build_diagram(q, strata)
            words = find_words(diagram)
            if not is_decomposable(q, words):
                indecomposable_strata["q"].append(str(int(q)))
                indecomposable_strata["Signature"].append((a,b))
                indecomposable_strata["Gamma Subscripts"].append(tuple(strata))
                indecomposable_strata["Word(s)"].append(" ".join(words))
                indecomposable_strata["EO Type"].append(find_EO_type(words))
                hs = hirashita_slope(indecomposable_strata["EO Type"][-1])
                indecomposable_strata["Hirashita Slope"].append(f"{hs[0]}/{hs[1]}")
        
    return pd.DataFrame(indecomposable_strata)

"""
Function hirashita_slope(EO_type)
   - EO_type: A list of integers containing the EO_type of a given strata

Computes the Hirashita Slope of a given strata via the EO_Type
"""
def hirashita_slope(EO_type):
    # Takes in an array of integers that is the EO type
    # From the EO type, compute the Hirashita slope
    q = EO_type[-1]
    EO_type = [EO_type[i] if EO_type[i] > 0 else i+q+1 for i in range(len(EO_type))] # Replace all "0"s in the EO_type with q+i

    psi = set(EO_type)     
    while True:
        new_psi = set([EO_type[i-1] for i in psi])
        if set(psi) == set(new_psi):
            numerator = sum([1 if i > q else 0 for i in new_psi]) 
            denominator = len(new_psi)
            HS_gcd = gcd(numerator, denominator)
            if HS_gcd != 1:
                numerator //= HS_gcd
                denominator //= HS_gcd
            return (numerator, denominator)
        psi = new_psi

"""
Function hirashita_slope(EO_type)
   - words: A list of words generated by a strata

Returns the strata associated with the word using Emerald/Heidi's method
"""
def words_to_Wyle(words):
    num_words = len(words)
    
    # Find the least common multiple between the lengths of the words so we can make them all the same length
    word_lens = [len(word) for word in words]
    lcm = 1
    for i in word_lens:
        lcm = lcm*i//gcd(lcm, i)
    
    # Make every word the same length
    for i in range(num_words):
        words[i] = words[i]*(lcm//len(words[i]))
        
    # Find all possible words variants
    full_word_list = []
    for word in words:
        full_word_list.extend([word[i:]+word[:i] for i in range(0, len(word), 2)])
        
    # Remove duplicate words
    full_word_list = list(set(full_word_list))
    
    # Sort the list
    full_word_list.sort()
    # Which indices end in "V"? Those are our strata
    strata = [i+1 for i in range(len(full_word_list)) if full_word_list[i][-1] == "V"]
    
    return strata

if __name__ == "__main__":
    
    all_strata = {"q":[], "Signature":[], "Strata":[], "Words":[], "EO_Type":[], "Hirashita_Slope": [], "NP_Slope": [], "Indecomposible": [], "Graph": []}
    
    max_q = 10
    for q in range(1, max_q+1):
        for b in range(q+1):
            for strata in list(itertools.combinations(list(range(1, q+1)), b)):
                diagram = build_diagram(q, strata)
                signature = (q-b, b)
                words = find_words(diagram)
                EO_Type = find_EO_type(words)
                HS_slope = hirashita_slope(EO_Type)
                NP_slope = find_NP_slope(words)
                decomposible = is_decomposable(q, words)
                
                # Add info to dataframe
                all_strata["q"].append(q)
                all_strata["Signature"].append(signature)
                all_strata["Strata"].append(strata)
                all_strata["Words"].append(words)
                all_strata["EO_Type"].append(EO_Type)
                all_strata["Hirashita_Slope"].append(HS_slope)
                all_strata["NP_Slope"].append(NP_slope)
                all_strata["Indecomposible"].append(not decomposible)
                all_strata["Graph"].append(diagram)
        print(q)
    
    all_strata = pd.DataFrame(all_strata)
    all_strata.to_csv("All_Strata.csv", index=False)
    all_strata.to_json("All_Strata.json", orient="records", indent=3)

                
                
                
    





