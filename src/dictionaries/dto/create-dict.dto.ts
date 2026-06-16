import { IsString, MaxLength } from 'class-validator';

export class CreateDictDto {
  @IsString()
  @MaxLength(100)
  slug!: string;

  @IsString()
  @MaxLength(255)
  name!: string;
}
