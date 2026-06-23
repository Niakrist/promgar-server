import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateDictDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsString()
  @MaxLength(255)
  image?: string;

}

