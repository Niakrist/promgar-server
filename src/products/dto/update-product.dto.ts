import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  IsInt,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  content?: string;

 @IsOptional()
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsInt()
  rollingBodyId?: number;

  @IsOptional()
  @IsInt()
  loadDirectionId?: number;

  @IsOptional()
  @IsInt()
  rowCountId?: number;

  @IsOptional()
  @IsInt()
  bearingTypeId?: number;

  // Размеры
  @IsOptional()
  @IsNumber()
  innerDiameterMm?: number;

  @IsOptional()
  @IsNumber()
  outerDiameterMm?: number;

  @IsOptional()
  @IsNumber()
  widthMm?: number;

  //   @IsOptional()
  //   @IsNumber()
  //   weightKg?: number;

  //   @IsOptional()
  //   @IsString()
  //   factoryNumber?: string;

  //   @IsOptional()
  //   @IsString()
  //   accuracyClass?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}
