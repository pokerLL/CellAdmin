import base64
import datetime
import json
import os

import matplotlib.pyplot as plt
import pandas as pd
from django.http import JsonResponse
from django.shortcuts import render

from .models import *

abpth = None


def index(request):
    return render(request, "cellForeGround/app.html", {})


def run_ajax(request):
    if request.method == "GET":
        return JsonResponse({})
    data = request.POST.dict()
    if data["dirname"] == "default":
        data["dirname"] = datetime.datetime.now().strftime("%Y_%m_%d__%H_%M_%S")
    if data["set_cho"][1] == '1':
        del data["set_cho"]
        data["autosave"] = True
    else:
        data["autosave"] = False

    global abpth
    abpth = os.path.abspath("").replace("\\", "/")
    if not init_cell_obj_path(abpth, data['dirname']):
        return JsonResponse({
            'code': 100,
        })

    cellobj = CellObj.objects.get_or_create(**data)[0]
    run_cell_obj(cellobj)
    _list = generate_graphs(cellobj)

    return JsonResponse({
        'code': 1,
        'dirname': data['dirname'],
        'model': data['model_cho'],
        'c_time': datetime.datetime.now(),
        'graphs': json.dumps(_list),
    })


def run_cell_obj(model):
    os.system(abpth + r"/cell.exe {}".format(model.model_cho))
    move_data_to(abpth, abpth + r"/cell_data/" + model.dirname)


def generate_graphs(model):
    gp_cho = model.gp_cho
    gplist = []
    pathprefix = os.path.abspath("").replace("\\", "/") + "/cell_data/"
    data_path = pathprefix + model.dirname + r"/"
    table_path = None
    filelist = os.listdir(data_path)
    for file in filelist:
        if file.endswith("b1.dat"):
            table_path = data_path + file
    print(table_path)
    if table_path is None:
        return {
            "code": 300,
        }
    data = pd.read_table(table_path, sep="\t", header=None, engine="python")
    # print(data)
    # input("pause....")
    for i in range(len(gp_cho)):
        if gp_cho[i] == '1':
            gplist.append(generate_graph(data, i, pathprefix + model.dirname))
        else:
            gplist.append("1")
    return gplist


def generate_graph(data, gpid, path):
    # print(path)
    col_list = [3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21]
    name_list = ["V-t图", "I-t图", "O_p1-t图", "P_IM-t图", "P_IC-t图", "P_C-t图", "I_F-t图", "P0-t图", "Q0-t图", "R0-t图",
                 "S0-t图", "T0-t图", "V0-t图", "W0-t图"]
    plt.plot(data[0], data[col_list[gpid]] - 1)
    plt.title(name_list[gpid][:-1])
    picname = path + "/pic/" + name_list[gpid][:-1] + ".png"
    plt.savefig(picname)
    plt.close()
    with open(picname, "rb") as f:
        base64_data = base64.b64encode(f.read())
        img = base64_data.decode()

    return img


def move_data_to(fromdir, todir):
    os.chdir(fromdir)
    filelist = os.listdir(fromdir)
    for f in filelist:
        if f.endswith(".dat"):
            os.rename(f, todir + "/" + f)


def init_cell_obj_path(abpth, todir):
    data_path = abpth + r"/cell_data/"
    try:
        os.mkdir(data_path)
    except:
        pass
    try:
        os.mkdir(data_path + todir)
        os.mkdir(data_path + todir + r"/pic")
    except:
        return False
    return True
