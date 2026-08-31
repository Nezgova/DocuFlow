package com.docuflow.security;

import com.docuflow.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwt; private final UserRepository users;
  public JwtAuthenticationFilter(JwtService jwt, UserRepository users){this.jwt=jwt;this.users=users;}
  @Override protected void doFilterInternal(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
    String header=request.getHeader("Authorization");
    if(header!=null && header.startsWith("Bearer ")) { String token=header.substring(7); if(jwt.valid(token)) users.findByEmailIgnoreCase(jwt.subject(token)).filter(u->u.isActive()).ifPresent(u->{var auth=new UsernamePasswordAuthenticationToken(u,null,java.util.List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole().name())));auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));SecurityContextHolder.getContext().setAuthentication(auth);}); }
    chain.doFilter(request,response);
  }
}
