#!/usr/bin/python3
""" Contains the User class """

from models.base_model import BaseModel, Base
from sqlalchemy import Column, Integer, String, Boolean
from models.business import Business
from sqlalchemy.orm import relationship

class User(BaseModel, Base):
    """ Class for user instances """
    __tablename__ = 'users'
    email = Column(String(128), nullable=False)
    password = Column(String(512), nullable=(False))
    first_name = Column(String(60), nullable=True)
    last_name = Column(String(60), nullable=True)
    ID_number = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    designation = Column(String(60), nullable=True)
    phone_number = Column(Integer, nullable=True)
    businesses = relationship("Business",
                              backref="user",
                              cascade="all, delete-orphan")