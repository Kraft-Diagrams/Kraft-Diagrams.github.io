import kraft_diagrams
import networkx as nx
import matplotlib.pyplot as plt
import itertools
import pandas as pd
from math import gcd
from numpy import cumsum
import json

def Weyl_to_Words(EO_type):
    g = len(EO_type)//2
    
    # Begin constructing the Weyl coset by making a "jump" array
    weyl_coset = [0 for i in range(2*g)]
    if EO_type[0] != 0:
        weyl_coset[0] = 1
        
    for i in range(1, 2*g):
        if EO_type[i] - EO_type[i-1] == 1:
            weyl_coset[i] = 1
    
    # Now assign numbers to the jump array. Start by assigning spots with
    # "1" with incrementing numbers started from 1. Then, repeat the process
    # with spots containing "0", with the counter starting from g+1
    counter = 1
    for i in range(2*g):
        if weyl_coset[i] == 1:
            weyl_coset[i] = counter
            counter += 1
    for i in range(2*g):
        if weyl_coset[i] == 0:
            weyl_coset[i] = counter
            counter += 1
            
    # 0- Based Indexing for ease - we'll convert back to 1-based indexing later
    weyl_coset = [i-1 for i in weyl_coset]
            
    # Create an indices array so we can keep track of the cycles in the Weyl coset
    indices = [i for i in range(0, 2*g)]
    
    # Find the cycles in the Weyl Coset, and convert them into words
    words = []
    for i in range(2*g):
        if indices[i] != -1:
            temp_path = [indices[i]]
            while indices[temp_path[-1]] != -1:
                indices[temp_path[-1]] = -1
                temp_path.append(weyl_coset[temp_path[-1]])
            temp_path = [j+1 for j in temp_path[:-1]]
            word = ""
            for j in temp_path:
                if j > g:
                    word += "V"
                else:
                    word += "F"
            order_word = [word[i:] + word[:i] for i in range(len(word))]
            order_word.sort()
            words.append(order_word[0])
    
    # Bring the Weyl coset back to 1-based indexing
    weyl_coset = [i+1 for i in weyl_coset]
    
    return weyl_coset, words

# Generate information for all possible Elementary Sequences in Ag
def generate_Ag(g):
    # Store all possible EO Types for this dimension
    all_EO_Types = []
    for EO_type in list(itertools.product([0, 1], repeat=g)):
        EO_type = list(EO_type)
        temp_EO = [int(i) for i in list(cumsum(EO_type))]
        for i in range(g-1, 0, -1):
            if temp_EO[i] - temp_EO[i-1] == 0:
                temp_EO.append(temp_EO[-1]+1)
            else:
                temp_EO.append(temp_EO[-1])
        if temp_EO[0] == 1:
            temp_EO.append(temp_EO[-1])
        else:
            temp_EO.append(temp_EO[-1]+1)
        #temp_EO = ",".join([str(i) for i in temp_EO])
        all_EO_Types.append(temp_EO)
        
    Ag_data = {}
    
    # Find information for all possible EO Types
    for EO_type in all_EO_Types:
        weyl_coset, words = Weyl_to_Words(EO_type)
        HS_Slope = kraft_diagrams.Harashita_Slope(EO_type)
        TL_Slopes = kraft_diagrams.TL_slope(words)
        SSL_Interaction = kraft_diagrams.SSLocus_Interaction(TL_Slopes, HS_Slope)
        Indecomposable = not kraft_diagrams.is_decomposable(g, words)
        
        Ag_data[",".join([str(i) for i in EO_type])] = {"Words":",".join(words), 
                                                        "Weyl_Coset":",".join([str(i) for i in weyl_coset]),
                                                        "HS_Slope":HS_Slope,
                                                        "TL_Slopes":TL_Slopes,
                                                        "SS_Locus_Interaction": SSL_Interaction,
                                                        "Indecomposible":Indecomposable,
                                                        "Unitary_Signatures":[],
                                                        "Unitary_Indices":[],
                                                        "Unitary_StratumDim":[]}
        
        
    # Find Unitary Signatures that map to these non-unitary variants
    
    for b in range(g+1):
        for strata in list(itertools.combinations(list(range(1, g+1)), b)):
            diagram = kraft_diagrams.build_diagram(g, strata)
            signature = (g-b, b)
            words = kraft_diagrams.find_words(diagram)
            EO_Type = ",".join([str(i) for i in kraft_diagrams.find_EO_type(words)])
            strata_dim = kraft_diagrams.stratum_dimension(strata, b)
            Ag_data[EO_Type]["Unitary_Signatures"].append(signature)
            Ag_data[EO_Type]["Unitary_Indices"].append(strata)
            Ag_data[EO_Type]["Unitary_StratumDim"].append(strata_dim)
    
            
    return Ag_data

if __name__ == "__main__":
    all_Ag_data = {}
    
    for g in range(1, 11):
        all_Ag_data.update(generate_Ag(g))
        
    with open("Ag_data.json", "w") as file:
        json.dump(all_Ag_data, file, indent=3)