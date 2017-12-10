# -*- coding: utf-8 -*-

# Made by Henry

from random import shuffle
import csv
import sys, os

lst = []

# Node.js에서 실행할 때 index.js 기준 경로지만, Python 단독 실행 시 현재 디렉토리 기준 경로로 설정해야 함
with open(os.getcwd() + '/config/algorithm/lotto.csv') as csvfile:
    readCSV = csv.reader(csvfile, delimiter = ',')
    for row in readCSV:
        for i in range(7):
            lst.append(int(row[i]))

    shuffle(lst)

    st = set({})

    for num in lst:
        if len(st) == 7:
            break
        st.add(num)

    if len(st) is not 7:
        print('Something is wrong')
        sys.exit(0)

    res = sorted(st)
    
    for num in res:
        print int(num)
    #sys.stdout.write(str(num) + ' ')