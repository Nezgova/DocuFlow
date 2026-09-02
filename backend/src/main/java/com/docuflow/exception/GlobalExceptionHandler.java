package com.docuflow.exception;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class) ResponseEntity<?> api(ApiException e){return response(e.getStatus(),e.getMessage());}
  @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e){String message=e.getBindingResult().getFieldErrors().stream().findFirst().map(x->x.getField()+": "+x.getDefaultMessage()).orElse("Invalid request");return response(HttpStatus.BAD_REQUEST,message);}
  @ExceptionHandler(Exception.class) ResponseEntity<?> unexpected(Exception e){
    e.printStackTrace();
    return response(HttpStatus.INTERNAL_SERVER_ERROR,"An unexpected error occurred: " + e.getMessage());
  }
  private ResponseEntity<?> response(HttpStatus status,String message){return ResponseEntity.status(status).body(Map.of("timestamp",Instant.now(),"status",status.value(),"error",status.getReasonPhrase(),"message",message));}
}
