import kraft_diagrams
import networkx as nx
import matplotlib.pyplot as plt
import itertools
import pandas as pd
from math import gcd
from numpy import cumsum

def Weyl_to_Words(EO_type):
    g = len(EO_type)//2
    
    # Begin constructing the Weyl coset by making a "jump" array
    weyl_coset = [0 for i in range(2*g)]
    if EO_type[0] == 0:
        weyl_coset[0] = 1
    else:
        weyl_coset[0] = 0
        
    for i in range(1, 2*g):
        if EO_type[i] - EO_type[i-1] == 0:
            weyl_coset[i] = 1
            
    counter = 1
    for i in range(2*g):
        if weyl_coset[i] == 1:
            weyl_coset[i] = counter
            counter += 1
    for i in range(2*g):
        if weyl_coset[i] == 0:
            weyl_coset[i] = counter
            counter += 1
            
    indices = [i for i in range(1, 2*g+1)]
    
    
    print(weyl_coset)

# Generate information for all possible Elementary Sequences in Ag
def generate_Ag(g):
    # Store all possible EO Types for this dimension
    all_EO_Types = []
    for EO_type in list(itertools.product([0, 1], repeat=g)):
        temp_EO = list(cumsum(EO_type))
        #temp_EO = ",".join([str(i) for i in temp_EO])
        all_EO_Types.append(temp_EO)
        
    #for EO_type in all_EO_Types:
        
        
    #all_EO_Types[temp_EO] = {"Words":None, "HS_Slope":None, "TL_Slopes":None, "Indecomposable":None, "SS_Locus_Interaction":None, "Graph":None, "F_Matrix":None, "V_Matrix":None, "Signatures":[], "Indices":[], "StrataDim":[]}
    """
    # Cycle over all signatures
    for b in range(q+1):
        # Cycle over all strata
        for strata in list(itertools.combinations(list(range(1, q+1)), b)):
            diagram = build_diagram(q, strata)
            signature = (q-b, b)
            words = find_words(diagram)
            EO_type = find_EO_type(words)
            HS_slope = Harashita_Slope(EO_type)
            TL_slopes = TL_slope(words)
            SS_locus = SSLocus_Interaction(TL_slopes, HS_slope)
            strata_dim = stratum_dimension(strata, b)
            F_matrix, V_matrix = build_adjacency_matrices(diagram)
            
            EO_type = ",".join([str(i) for i in EO_type[:q]])
            
            all_EO_Types[EO_type]["Signatures"].append(signature)
            all_EO_Types[EO_type]["Indices"].append(strata)
            all_EO_Types[EO_type]["StrataDim"].append(strata_dim)
            all_EO_Types[EO_type]["Words"] = words
            all_EO_Types[EO_type]["HS_Slope"] = HS_slope
            all_EO_Types[EO_type]["TL_Slopes"] = ", ".join(TL_slopes)
            if len(words) == 1 or len(words) == 2:
                all_EO_Types[EO_type]["Indecomposable"] = True
            else:
                all_EO_Types[EO_type]["Indecomposable"] = False
            all_EO_Types[EO_type]["SS_Locus_Interaction"] = SS_locus
            all_EO_Types[EO_type]["Graph"] = d3_diagram(diagram)
            all_EO_Types[EO_type]["F_Matrix"] = F_matrix
            all_EO_Types[EO_type]["V_Matrix"] = V_matrix
    """
            
    return all_EO_Types

if __name__ == "__main__":
    Weyl_to_Words([0, 1, 1, 1, 2, 3, 3, 3, 4, 5, 5, 6])