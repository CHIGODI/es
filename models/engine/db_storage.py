#!/usr/bin/env python3
""" Contains the DBStorage class """

from sqlalchemy import create_engine
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker, scoped_session
from models.base_model import Base
from os import getenv
from models.user import User
from models.business import Business
from models.category import Category
from models.permit import Permit
from models.mpesa import Mpesa


load_dotenv()


classes = {"User": User, "Business": Business,
           "Category": Category, "Permit": Permit,
           "Mpesa": Mpesa}


class DBStorage:
    """ storage class for database """
    __session = None
    __engine = None

    def __init__(self):
        """ initializes the DBStorage class """
        EPERMIT_MYSQL_USER = getenv('EPERMIT_MYSQL_USER')
        EPERMIT_MYSQL_PWD = getenv('EPERMIT_MYSQL_PWD')
        EPERMIT_MYSQL_HOST = getenv('EPERMIT_MYSQL_HOST')
        EPERMIT_MYSQL_DB = getenv('EPERMIT_MYSQL_DB')
        EPERMIT_ENV = getenv('EPERMIT_ENV')
        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.
                                      format(EPERMIT_MYSQL_USER,
                                             EPERMIT_MYSQL_PWD,
                                             EPERMIT_MYSQL_HOST,
                                             EPERMIT_MYSQL_DB),
                                      pool_pre_ping=True )

        if EPERMIT_ENV == 'test':
            Base.metadata.drop_all(self.__engine)


    def new(self, obj):
        """ saves an object to the database """
        self.__session.add(obj)

    def save(self):
        """ commits all changes to the database """
        self.__session.commit()

    def all(self, cls=None):
        """ retrieves all objects from the database """
        new_dict = {}
        for clas in classes:
            if cls is None or cls is classes[clas] or cls is clas:
                objects = self.__session.query(classes[clas]).all()
                for obj in objects:
                    key = "{}.{}".format(type(obj).__name__, obj.id)
                    new_dict[key] = obj
        return new_dict


    def get_obj_by_id(self, cls, id):
        """ retrieves an object from the database """
        if cls is None or id is None:
            return None
        return self.__session.query(cls).get(id)


    def get_user_by_email(self, email):
        """ retrieves a user by email """
        if email is None:
            return None
        return self.__session.query(User).filter(User.email == email).first()



    # added function to get unverified/rejected businesses
    def get_unverified_businesses(self):
        """ retrieves all unverified businesses """
        return self.__session.query(Business).filter(Business.status == 'Pending').all()

    # Get a business details
    def get_business_details(self, business_id):
        """ Retrieve details of a specific business by its ID """
        return self.__session.query(Business).filter_by(id=business_id).first()

    #get rejected businesses
    def get_rejected_businesses(self):
        """ retrieves all rejected businesses """
        return self.__session.query(Business).filter(Business.status == 'Rejected').all()

    # get rejected business by id
    def get_rejected_businesses_by_id(self, id):
        """ Retrieve rejected businesses """
        if id is None:
            return None
        else:
            rej = self.__session.query(Business).filter(Business.status == 'Rejected').first()
            print(rej)
            return rej
    # get approved businesses
    def get_approved_businesses(self):
        """ retrieves all approved businesses """
        return self.__session.query(Business).filter(Business.status == 'Approved' ).all()
    
    def get_approved_businesses_by_id(self, id):
        """ Retrieve approved businesses """
        if id is None:
            return None
        else:
            return self.__session.query(Business).filter(Business.verified == True).first()

    # save rejected businesses
    def reject_business(self, business_id):
        """Rejects a business by setting its verified status to False"""
        business = self.get_obj_by_id(Business, business_id)
        if business:
            business.status = 'Rejected'
            business.verified = False
            self.save()

    # save approve businesses
    def approve_business(self, business_id):
        """Approves a business by setting its verified status to True"""
        business = self.get_obj_by_id(Business, business_id)
        if business:
            business.status = 'Approved'
            business.verified = True
            self.save()

    def get_permit_by_business_id(self, business_id):
        """ retrieves a permit by business id """
        if business_id is None:
            return None
        permit = self.__session.query(Permit).filter(Permit.business_id == business_id).first()
        if permit:
            return permit
        else:
            return None

    def delete(self, obj=None):
        """ deletes an object from the current database """
        if obj is not None:
            self.__session.delete(obj)

    def reload(self):
        """reloads data from the database"""
        Base.metadata.create_all(self.__engine)
        sess_factory = sessionmaker(bind=self.__engine, expire_on_commit=False)
        Session = scoped_session(sess_factory)
        self.__session = Session

    def count(self, cls=None):
        """ counts the number of objects in the database """
        if cls is None:
            cls_count = 0
            for i in self.all().values():
                cls_count += 1
            return cls_count
        else:
            cls_count = 0
            for i in self.all(cls).values():
                cls_count += 1
            return cls_count

    def close(self):
        """ closes the session """
        self.__session.remove()
