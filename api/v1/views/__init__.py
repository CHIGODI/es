#!/usr/bin/python3
""" Module for the API """
from flask import Blueprint
app_views = Blueprint('app_views', __name__, url_prefix='/api/v1')
from api.v1.views.index import *
from api.v1.views.users import *
from api.v1.views.businesses import *
from api.v1.views.categories import *
from api.v1.views.create_permit import *
from api.v1.views.mpesa import *