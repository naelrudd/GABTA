'use strict';

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    locationLat: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    locationLng: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    radiusMeters: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      field: 'radius_meters'
    },
    className: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'class_name'
    },
    kodeKelas: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'kode_kelas'
    },
    maxCapacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      field: 'max_capacity'
    },
    qrSecret: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    tableName: 'sessions'
  });

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: 'creatorId',
      as: 'creator'
    });
    Session.hasMany(models.AttendanceRecord, {
      foreignKey: 'sessionId',
      as: 'attendances'
    });
  };

  return Session;
};