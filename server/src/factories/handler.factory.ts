import AppError from '../errors/app.error';
// import { APIFeatures } from '@src/utils/api.utils';

// export const createOne =
//   (
//     Entity: Model<any>
//     // eslint-disable-next-line no-unused-vars
//   ) =>
//   async (
//     req,
//     res,
//     next
//   ) => {
//     const newEntity = await Entity.create(req.body);

//     try {
//       return res.status(201).json({
//         status: true,
//         data: newEntity,
//         message: 'created successfully',
//       });
//     } catch (error: any) {
//       return next(error);
//     }
//   };

export const getOne = (Entity, populate) => async (req, res, next) => {
  try {
    const query = Entity.findById(req.params.id);

    if (populate) {
      query.populate(populate);
    }

    const existingEntity = await query;

    if (!existingEntity)
      return next(new AppError(404, 'Resource does not exist'));

    return res.json({
      status: true,
      data: existingEntity,
      message: 'retrieved successfully'
    });
  } catch (error: any) {
    return next(error);
  }
};

// export const getAll =
//   (Entity: Model<any>) =>
//   async (
//     req,
//     res,
//     next
//   ) => {
//     try {
//       const features = new APIFeatures(Entity.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();

//       const models = await features.query;

//       return res.json({
//         status: true,
//         data: {
//           items: models,
//           count: models.length,
//         },
//         message: 'retrieved successfully',
//       });
//     } catch (error: any) {
//       return next(error);
//     }
//   };

// export const deleteOne =
//   (Entity: Model<any>) =>
//   async (
//     req,
//     res,
//     next
//   ) => {
//     const doc = await Entity.findByIdAndDelete(req.params.id);

//     if (!doc) return next(new AppError('Resource does not exist', 404));

//     return res
//       .status(204)
//       .json({ status: true, data: null, message: 'Deleted successfully' });
//   };

// export const updateOne =
//   (Entity: Model<any>) =>
//   async (
//     req,
//     res,
//     next
//   ) => {
//     console.log(req.body);
//     const updatedModel = await Entity.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!updatedModel)
//       return next(new AppError('Resource does not exist', 404));

//     return res.json({
//       status: true,
//       data: updatedModel,
//       message: 'Updated successfully',
//     });
//   };
