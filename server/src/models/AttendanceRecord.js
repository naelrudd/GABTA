'use strict';

module.exports = (sequelize, DataTypes) => {
  const AttendanceRecord = sequelize.define('AttendanceRecord', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sessions',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    locationLat: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    locationLng: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('present', 'late', 'absent'),
      allowNull: false,
      defaultValue: 'present'
    }
  }, {
    timestamps: true,
    tableName: 'attendance_records'
  });

  AttendanceRecord.associate = (models) => {
    AttendanceRecord.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    AttendanceRecord.belongsTo(models.Session, {
      foreignKey: 'sessionId',
      as: 'session'
    });
  };

  return AttendanceRecord;
};