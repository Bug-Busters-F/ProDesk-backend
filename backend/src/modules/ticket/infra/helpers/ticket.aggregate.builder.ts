export class TicketAggregateBuilder {
  static agentLookup() {
    return [
      {
        $lookup: {
          from: 'users',
          let: { agentId: '$agentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$$agentId', null] },
                    { $eq: [{ $toString: '$_id' }, '$$agentId'] },
                  ],
                },
              },
            },
          ],
          as: 'agentData',
        },
      },
      {
        $addFields: {
          agent: {
            $cond: {
              if: { $gt: [{ $size: '$agentData' }, 0] },
              then: {
                id: { $toString: { $arrayElemAt: ['$agentData._id', 0] } },
                name: { $arrayElemAt: ['$agentData.name', 0] },
              },
              else: null,
            },
          },
        },
      },
    ];
  }

  static categoryLookup() {
    return [
      {
        $lookup: {
          from: 'categories',
          let: { categoryId: '$category' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$$categoryId', null] },
                    { $eq: [{ $toString: '$_id' }, '$$categoryId'] },
                  ],
                },
              },
            },
          ],
          as: 'categoryData',
        },
      },
      {
        $addFields: {
          category: {
            $cond: {
              if: { $gt: [{ $size: '$categoryData' }, 0] },
              then: {
                id: { $toString: { $arrayElemAt: ['$categoryData._id', 0] } },
                name: { $arrayElemAt: ['$categoryData.name', 0] },
              },
              else: null,
            },
          },
        },
      },
    ];
  }

  static clientLookup() {
    return [
      {
        $lookup: {
          from: 'users',
          let: { id: '$clientId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$$id', null] },
                    { $eq: [{ $toString: '$_id' }, '$$id'] },
                  ],
                },
              },
            },
          ],
          as: 'clientData',
        },
      },
      {
        $addFields: {
          client: {
            $cond: {
              if: { $gt: [{ $size: '$clientData' }, 0] },
              then: {
                id: { $toString: { $arrayElemAt: ['$clientData._id', 0] } },
                name: { $arrayElemAt: ['$clientData.name', 0] },
              },
              else: null,
            },
          },
        },
      },
    ];
  }

  static cleanup() {
    return {
      $unset: ['agentData', 'categoryData', '__v'],
    };
  }

  static buildAggregate() {
    return [
      ...this.agentLookup(),
      ...this.categoryLookup(),
      ...this.clientLookup(),
      this.cleanup(),
    ];
  }

  static countTicketByField(field: string) {
    return [
      { $group: { _id: `$${field}`, count: { $sum: 1 } } },
      { $sort: { _id: 1 as const } },
    ];
  }

  static countTotal() {
    return [{ $count: 'total' }];
  }

  static avgResolutionTime() {
    return [
      {
        $match: { closedAt: { $ne: null } },
      },
      {
        $group: {
          _id: null,
          avgMs: {
            $avg: { $subtract: ['$closedAt', '$createdAt'] },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          avgHours: { $divide: ['$avgMs', 1000 * 60 * 60] },
          avgMinutes: { $divide: ['$avgMs', 1000 * 60] },
          avgDays: { $divide: ['$avgMs', 1000 * 60 * 60 * 24] },
        },
      },
    ];
  }

  static buildMetrics() {
    return [
      {
        $facet: {
          total: TicketAggregateBuilder.countTotal(),
          byStatus: TicketAggregateBuilder.countTicketByField('status'),
          avgResolutionTime: TicketAggregateBuilder.avgResolutionTime(),
        },
      },
    ];
  }
}
